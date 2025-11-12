import geopandas as gpd
from sqlalchemy import create_engine

# Connection with  PostgreSQL database (spatial_db)
engine = create_engine("postgresql://postgres:Riyon%402005@localhost:5432/spatial_db")

districts = gpd.read_file(r"data\Bangalore Wards.shp")
districts.to_postgis("bangalore_wards", engine, if_exists="replace", index=False)
print("Districts uploaded to PostGIS as bangalore_wards")

roads = gpd.read_file(r"data\Roads_PCS.shp")
roads.to_postgis("bangalore_roads", engine, if_exists="replace", index=False)
print("Roads uploaded to PostGIS as bangalore_roads")

busstops = gpd.read_file(r"data\Bustop_PCS.shp")
busstops.to_postgis("bangalore_busstops", engine, if_exists="replace", index=False)
print("Bus stops uploaded to PostGIS as bangalore_busstops")