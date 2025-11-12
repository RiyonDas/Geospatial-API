# Geospatial API
Built an Interactive Geospatial API providing statistical data for every ward of Bengaluru. It can be used for spatial analysis of major locations inside the city boundary. It provides a holistic and highly dynamic environment with wards, bus stops, and roadways with click-based or search-based data fetching of bus stop count, area square km, and choosen location with respect to the Area Of Interest (AOI). 

## User Workflow
Click a ward polygon/Search a location -> Zooms into the selected location -> Shows the Ward statistics panel on the top-right corner -> User can infer data like Ward number, Bus stop count, and area square kilometers.

## API Architecture
PostgreSQL Database is connected with the API -> Datasets are uploaded to the database -> Data request is sent from the UI -> Request enters the API and runs based on the code logic -> Desired data is fetched from the entire database -> Response is sent from the database to the API -> API runs the frontend code logic -> Data gets visualised in the web application.
