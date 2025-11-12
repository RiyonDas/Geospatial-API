from flask import Flask, jsonify, request, render_template
from sqlalchemy import create_engine
import geopandas as gpd

app = Flask(__name__)

# Connection with PostgreSQL database (spatial_db)
engine = create_engine("postgresql://postgres:Riyon%402005@localhost:5432/spatial_db")

# Reading the attribute table using geopandas & SQL
districts = gpd.read_postgis("SELECT * FROM bangalore_wards", engine, geom_col="geometry")
roads = gpd.read_postgis("SELECT * FROM bangalore_roads", engine, geom_col="geometry")
busstops = gpd.read_postgis("SELECT * FROM bangalore_busstops", engine, geom_col="geometry")

districts = districts.to_crs(epsg=4326)
roads = roads.to_crs(epsg=4326)
busstops = busstops.to_crs(epsg=4326)

# Routing the HTML page
@app.route("/")
def home():
    return render_template('index.html')

# Routing Geojson Bangalore wards data
@app.route("/geojson/BangaloreDistricts")
def get_districts_geojson():
    return districts.to_json()

# Routing Geojson Bangalore roads data
@app.route("/geojson/BangaloreRoads")
def get_roads_geojson():
    return roads.to_json()

# Routing Geojson Bangalore bustops data
@app.route("/geojson/BangaloreBustops")
def get_busstops_geojson():
    return busstops.to_json()

# Routing Bangalore Wards
@app.route("/stats/BangaloreDistricts")
def district_stats():
    name = request.args.get("name")
    if name:
        filtered_districts = districts[districts["ASS_CONST1"].str.lower() == name.lower()]
    else:
        filtered_districts = districts
    filtered_districts["District_sq_km"] = filtered_districts.geometry.area/1000000 
    stats = {
        "Filtered by": name if name else "All Districts",
        "Total number of wards": len(filtered_districts),
        "Total area (sqkm)": filtered_districts["District_sq_km"].sum(),
        "Average area (sqkm)": filtered_districts["District_sq_km"].mean()
    }
    return jsonify(stats)

# Routing Bangalore Roads
@app.route("/stats/BangaloreRoads")
def roads_stats():
    name = request.args.get("type")
    if name:
        filtered_roads = roads[roads["highway"].str.lower() == name.lower()]
    else:
        filtered_roads = roads
    filtered_roads["Roads_length_km"] = filtered_roads.geometry.length/1000
    stats = {
        "Filtered by": name if name else "All Roads",
        "Total number of roads": len(filtered_roads),
        "Total length (km)": filtered_roads["Roads_length_km"].sum(),
        "Average length (km)": filtered_roads["Roads_length_km"].mean()
    }
    return jsonify(stats)

# Routing Bangalore Bus Stops
@app.route("/stats/BangaloreBustops")
def busstops_stats():
    name = request.args.get("ward")
    if name:
        name = int(name)
        filtered_busstops = busstops[busstops["Ward_No"] == name]
        filtered_ward = districts[districts["WARD_NO"] == name]
        if not filtered_ward.empty:

            # Reprojecting to UTM
            ward_projected = filtered_ward.to_crs(epsg=32643) 
            area_sqkm = ward_projected.geometry.area.iloc[0] / 1_000_000
        else:
            area_sqkm = None
    else:
        filtered_busstops = busstops
        area_sqkm = None
    stats = {
        "Filtered by Ward Number": name if name else "All Wards",
        "Total number of bus stops": len(filtered_busstops),
        "Area (sqkm)": round(area_sqkm, 2) if area_sqkm else "N/A"
    }
    return jsonify(stats) 

# Running the API
if __name__ == "__main__":
    app.run(debug = True)