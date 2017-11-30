L.mapbox.accessToken = 'pk.eyJ1IjoidG9tZS1tYXBib3giLCJhIjoiY2o0a2E2YWg2MGhldTMycDM0aWx1OG94NCJ9.vsZa2d1a649RpQxmPQytZA';
var map = L.mapbox.map('map', 'mapbox.dark',{ zoomControl:false })
    .setView([36.8508, -76.2859], 5);
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
var visLayer;
var circleScale = 10;
var maxScore = 0;

var truncateDecimals = function (number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

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
      console.log(data);
      addMapData(data);
      updateMapInfo(data);
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
  maxScore = 0;
}

function addMapData(locations) {
  var geoJsonData = {
    type: "FeatureCollection",
    features: []
  };
  $.each(locations, function (id, loc) {
    console.log(loc);
    var locationMarker = {
      type: 'Feature',
      properties: {
        name: loc.location.city + ", " + loc.location.state,
        topics: [],
        count: 0
      },
      geometry: {
        type: 'Point',
        coordinates: [loc.location.lng, loc.location.lat]
      }
    };
    $.each(loc.topics, function(i, t) {
      console.log("ADDING NEW TOPIC TO " + loc.location.city);
      locationMarker.properties.topics.push(t);
      locationMarker.properties.count += t.score;
    });
    if (locationMarker.properties.count > maxScore) {
      maxScore = locationMarker.properties.count;
    }
    geoJsonData.features.push(locationMarker);
  });

  visLayer = L.geoJson(geoJsonData, {
      pointToLayer: function(feature, latlng) {
        console.log("MAPY T : " + feature.properties.topics);
        //var tClr = topics.getColor(feature.properties.topic);
        //if (tClr === undefined) return;
        tClr = ["#ffffff"];
        var opacity = d3.scale.linear()
            .domain([0, maxScore])
            .range([0.25, 0.9]);
        size = 10;
        console.log(feature.properties);
        var markerOptions = {
          //radius: feature.properties.count * circleScale,
          radius: size,
          fillColor: tClr,
          color: tClr,
          weight: 1,
          opacity: 1,
          fillOpacity: opacity(feature.properties.count)
        }
        var popupOptions = { maxWidth: 500 };
        var popupContent = '<div>';
        var s = (feature.properties.topics.length > 1) ? "s" : "";
        popupContent += '<h6>' + "Topic" + s + " ";
        $.each(feature.properties.topics, function(i, topic) {
          var c = (i + 1 >= feature.properties.topics.length) ? "" : ", ";
          popupContent += topic.key + c;
        });
        popupContent += '</h6>';
        popupContent += '<span>' + truncateDecimals(feature.properties.count, 4)
          + '%</span>' + '</div>';
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
          popUpTip.style.borderTopColor = tClr;
          popUp.style.borderColor = tClr;
          popUp.style.backgroundColor = "white";
        });
        return circle;
      }
  }).addTo(map);
}

var updateMapInfo = function(data) {
  $("#map-info table").html("");
  console.log("MAP INFO");
  console.log(data);
  $.each(data, function(loc_id, loc_data) {
    console.log("HERE: " + loc_id)
    var section = "<tbody data-loc='" + loc_id + "'></tbody>";
    $("#map-info table").append(section)
    $.each(loc_data.papers, function(paper_id, paper_data) {
      var pieData = {
        size: {
          canvasHeight: 250,
          canvasWidth: 250
        },
        header: {
          title: {
            text: ""
          }
        },
        data: {
          content: []
        },
        misc: {
		      colors: {
	          segments: []
          }
		    }
      }
      var perc = 100;
      $.each(paper_data.topics, function(id, topic) {
        perc -= topic.score;
        pieData.data.content.push({
          label:topic.key,
          value: topic.score
        });
        pieData.misc.colors.segments.push(topics.getColor(topic.key));
      });
      pieData.data.content.push({
        label: "Unselected",
        value: perc
      });
      pieData.misc.colors.segments.push(topics.defaultColor);
      console.log(pieData.data.content);
      var subsection = "<tr data-paper-id='" + paper_id + "'>"
        + "<td class='title'>" + paper_data.title + "</td>"
        + "<td class='pie'></td>"
        + "<td class='bars'></td>"
      + "</tr>";
      var el = $(subsection)[0];
      console.log(el);
      var pie = new d3pie(el.getElementsByClassName('pie')[0], pieData);
      $("#map-info table [data-loc='" + loc_id + "']").append(el);
    });
  });

}
