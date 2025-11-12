// Initialize the map
const map = L.map('map').setView([12.97, 77.59], 11);

// 🌑 Dark base map (Carto Dark Matter)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Getting search input element
const searchInput = document.getElementById("search");

// Adding Roads Layer
fetch('/geojson/BangaloreRoads')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#ff0000',
        weight: 1.2
      }
    }).addTo(map);
  })
  .catch(err => console.error('Error loading roads:', err));

// Adding Bus Stops Layer
fetch('/geojson/BangaloreBustops')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 4,
          fillColor: '#00ff00',
          color: '#006600',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.Name) {
          layer.bindPopup(`<b>Bus Stop:</b> ${feature.properties.Name}`);
        }
      }
    }).addTo(map);
  })
  .catch(err => console.error('Error loading bus stops:', err));

// Fetching GeoJSON wards
fetch("/geojson/BangaloreDistricts")
  .then(res => res.json())
  .then(data => {
    const wardNames = data.features.map(f => f.properties.ASS_CONST1);
    const wardLayer = L.geoJSON(data, {
      style: {
        color: "#3388ff",
        weight: 1,
        fillOpacity: 0.4
      },
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: (e) => {
            e.target.setStyle({ weight: 3, color: "#ff6600", fillOpacity: 0.6 });
          },
          mouseout: (e) => {
            wardLayer.resetStyle(e.target);
          },
          click: () => {
            const wardName = feature.properties.ASS_CONST1;
            const wardNo = feature.properties.WARD_NO;

            document.getElementById("stats-output").innerHTML = `
              <b>Location:</b> ${wardName}<br>
              <i>Loading statistics...</i>
            `;

            fetch(`/stats/BangaloreBustops?ward=${wardNo}`)
              .then(res => res.json())
              .then(stats => {
                document.getElementById("stats-output").innerHTML = `
                  <b>Location:</b> ${wardName}<br>
                  <b>Filtered by Ward Number:</b> ${stats["Filtered by Ward Number"]}<br>
                  <b>Total Bus Stops:</b> ${stats["Total number of bus stops"]}<br>
                  <b>Area (sqkm):</b> ${stats["Area (sqkm)"]}
                `;
              })
              .catch(() => {
                document.getElementById("stats-output").innerHTML = `
                  <b>Ward:</b> ${wardName}<br>
                  <span style="color:red;">Failed to load statistics.</span>
                `;
              });
          }
        });
      }
    }).addTo(map);

    searchInput.addEventListener("input", function () {
      closeSuggestions();

      const val = this.value.toLowerCase();
      if (!val) return;

      const matches = wardNames.filter(name =>
        name.toLowerCase().includes(val)
      );

      const suggestionBox = document.createElement("div");
      suggestionBox.setAttribute("id", "autocomplete-list");
      suggestionBox.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(suggestionBox);

      matches.slice(0, 10).forEach(match => {
        const item = document.createElement("div");
        item.innerHTML = `<strong>${match.substr(0, val.length)}</strong>${match.substr(val.length)}`;
        item.addEventListener("click", function () {
          searchInput.value = match;
          closeSuggestions();
          zoomToWard(match);
        });
        suggestionBox.appendChild(item);
      });
    });

    // Zooming to the selected ward
    function zoomToWard(name) {
      const feature = data.features.find(f => f.properties.ASS_CONST1 === name);
      if (feature) {
        const bounds = L.geoJSON(feature).getBounds();
        map.fitBounds(bounds);
      }
    }

    function closeSuggestions() {
      const items = document.getElementsByClassName("autocomplete-items");
      for (let i = 0; i < items.length; i++) {
        items[i].parentNode.removeChild(items[i]);
      }
    }

    document.addEventListener("click", (e) => {
      if (e.target !== searchInput) closeSuggestions();
    });
  })
  .catch(err => console.error("Error loading GeoJSON:", err));
