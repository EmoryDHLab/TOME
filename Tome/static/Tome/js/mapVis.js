L.mapbox.accessToken = 'pk.eyJ1IjoidG9tZS1tYXBib3giLCJhIjoiY2o0a2E2YWg2MGhldTMycDM0aWx1OG94NCJ9.vsZa2d1a649RpQxmPQytZA';
var map = L.mapbox.map('map', 'mapbox.dark',{ zoomControl:false })
    .setView([36.8508, -76.2859], 5);
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
var visLayer;
var circleScale = 10;

// GeoJSON data: see http://geojson.org/ for the full description of this format.
//
// In these lines, we create some random points. This, of course, you can change:
// instead, your data can be hardcoded as a Javascript object, or pulled in
// from an external file with AJAX, or loaded from Mapbox automatically.

function updateMapLocations(keys) {
  $.ajax({
    type : "GET",
    url : map_data_link,
    data : {
      json_data : JSON.stringify({'topics' : keys})
    },
    success : function(data) {
      console.log(data);
      if (visLayer != undefined){
        clearMapData();
      }
      addMapData(data);
      if (keys.length == 0) {
        $("#map-wrapper").css("display","none");
        // fix map resizes issue
        map.invalidateSize();
      } else {
        $("#map-wrapper").css("display","block");
        // fix map resizes issue
        map.invalidateSize();
      }
      // endLoad();
    },
    error : function(textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

function clearMapData() {
  map.removeLayer(visLayer);
}

function addMapData(locations) {
  var geoJsonData = {
    type: "FeatureCollection",
    features: []
  };
  $.each(locations, function (id, loc) {
    console.log(loc);
    $.each(loc.topics, function(i, t){
      geoJsonData.features.push({
        type: 'Feature',
        properties: {
          name: loc.location.city + ", " + loc.location.state,
          topic: t.key,
          // The important part is here: that each feature has some property
          // that we refer to later on, in `pointToLayer`, that determines
          // the size of the scaled circle.
          count: t.score
        },
        geometry: {
          type: 'Point',
          coordinates: [loc.location.lng, loc.location.lat]
        }
      });
    });
  });

  visLayer = L.geoJson(geoJsonData, {
      pointToLayer: function(feature, latlng) {
        console.log("MAPY T : " + feature.properties.topic);
        var tClr = topics.getColor(feature.properties.topic);
        if (tClr === undefined) return;
        var rgbClr = (function() {
          var rgbVals = [];
          for (var i = 1; i < tClr.length; i+=2) {
            rgbVals.push(parseInt(tClr.charAt(i) + tClr.charAt(i + 1), 16))
          }
          return rgbVals;
        })();
        var markerOptions ={
          radius: feature.properties.count * circleScale,
          fillColor: tClr,
          color: tClr,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.4
        }
        var popupOptions = {maxWidth: 500};
        var tr = '<tr id="" class="location info">'
          + '<td class="p-title">' + '</td>'
          + '<td class="t-pie"></td>'
          + '<td class="t-bars"></td>'
        + '</tr>'
        var popupContent = '<div>'
            + '<h4>' + "Topic " + feature.properties.topic + '</h4>'
            + '<span>' + feature.properties.count + '%</span>'
          + '</div>';
        var circle = L.circleMarker(latlng, markerOptions);
        circle.bindPopup(popupContent, popupOptions);
        circle.on('mouseover', function() {
          circle.setStyle({ weight: 3 });
        });
        circle.on('mouseout', function() {
          circle.setStyle({ weight: markerOptions.weight });
        });
        circle.on('click', function() {
          circle.openPopup(latlng);
          var popUp = this.getPopup().getElement().querySelector('.leaflet-popup-content-wrapper');
          var popUpTip = this.getPopup().getElement().querySelector('.leaflet-popup-tip');
          console.log(rgbClr);
          popUpTip.style.borderTopColor = tClr;
          popUp.style.borderColor = tClr;
          popUp.style.backgroundColor = "rgba(" + rgbClr[0]
            + ", " + rgbClr[1] + ", " + rgbClr[2] + ", .5)"
        });
        return circle;
      }
  }).addTo(map);
}



var pie = new d3pie(document.querySelector('#n1 .t-pie'), {
  size: {
    canvasHeight: 120,
    canvasWidth: 140
  },
  header: {
		title: {
			text: ""
		}
	},
	data: {
		content: [
			{ value: 1.3, color: "#0000ff" },
			{ value: 1.4, color: "#00ffff" },
			{ value: 97.3, color: "#d8d8d8"},
		]
	}
});
