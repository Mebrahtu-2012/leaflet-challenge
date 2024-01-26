// Store earthquake API endpoint as queryUrl.
let earthquakeQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Store tectonic plates API endpoint.
let tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Define overlayMaps object to store layers.
let overlayMaps = {};

// Create an empty myMap variable.
let myMap;

// Perform a GET request to the earthquake query URL.
d3.json(earthquakeQueryUrl).then(function (earthquakeData) {
  createFeatures(earthquakeData.features);
});

// Create a layer for tectonic plates.
d3.json(tectonicPlatesUrl).then(function (platesData) {
  let tectonicPlates = L.geoJSON(platesData, {
    style: function (feature) {
      return {
        color: "orange", 
        weight: 2,
      };
    }
  });

  // Add tectonic plates layer to the overlays object.
  overlayMaps["Tectonic Plates"] = tectonicPlates;
  tectonicPlates.addTo(myMap);
});

//getColor function 
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

  let darkMap = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Dark Map": darkMap
  };

  // Create myMap outside the d3.json callback
  myMap = L.map("map", {
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

    //Legend title.
    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";

    //Legend labels.
    for (let i = 0; i < depthRanges.length - 1; i++) {
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

