// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

// getColor function 
function getColor(depth) {
  return depth > 90 ? 'grey' :
    depth > 70 ? 'red' :
      depth > 50 ? 'orange' :
        depth > 30 ? 'yellow' :
          depth > 10 ? 'yellowgreen' :
            'green';
}

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 5,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });

  createMap(earthquakes);
}

function createMap(earthquake) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  let overlayMaps = {
    Earthquakes: earthquake
  };

  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquake]
  });

  // Create a legend
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depthRanges = [-10, 10, 30, 50, 70, 90];
    let labels = [];
  
    // Add the legend title.
    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
  
    // Add the legend labels.
    for (let i = 0; i < depthRanges.length ; i++) {
      labels.push(
        '<i style="background:' +
          getColor(depthRanges[i] + 1) +
          '"></i> ' +
          depthRanges[i] +
          (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+')
      );
    }
  
    // Add the labels to the legend.
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };
  legend.addTo(myMap);

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
