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

var getPieData = function(paper_data) {
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
    },
    labels: {
  		outer: {
  			pieDistance: 14
  		},
  		inner: {
  			format: "none",
  			hideWhenLessThanPercentage: 100
  		},
  		mainLabel: {
  			fontSize: 11
  		},
  		percentage: {
  			color: "#ffffff",
  			decimalPlaces: 0
  		},
  		value: {
  			color: "#adadad",
  			fontSize: 11
  		},
  		lines: {
  			enabled: true
  		},
  		truncation: {
  			enabled: true
  		}
  	},
    effects: {
  		load: {
  			speed: 500
  		},
  		pullOutSegmentOnClick: {
  			effect: "none",
  			speed: 400,
  			size: 8
  		}
  	}
  }
  var perc = 100;
  $.each(paper_data.topics, function(id, topic) {
    perc -= topic.score;
    pieData.data.content.push({
      label: "Topic " + topic.key,
      value: topic.score
    });
    pieData.misc.colors.segments.push(topics.getColor(topic.key));
  });
  pieData.data.content.push({
    label: "Unselected",
    value: perc
  });
  pieData.misc.colors.segments.push(topics.defaultColor);
  return pieData;
}

/*
 *
 * Used for getting the bar next to the pie charts in the map section
 * paper: the paper data (location, topics, etc)
 * paperId: the id of the paper
 *
 */
function getPercCompBar(paperId, paperData) {
  var totalPerc = 0;
  var shifts = {};
  $.each(paperData['topics'], function(i, tpc) {
    var percent = tpc.score;
    totalPerc += percent;
    shifts[tpc.key] = totalPerc - percent;
  });
  console.log(paperData);
  var margin = {top: 10, right: 30, bottom: 50, left: 30};

  var sizes = {
    width : $(".bars").innerWidth()
      - margin.left - margin.right,
    offset : 5,
    height : 40,
    gap: 30
  };

  var scale = {
    x: d3.scale.linear()
    .domain([0, totalPerc])
    .range([0, sizes.width])
    .clamp(true),
    overall: d3.scale.linear()
      .domain([0, 100])
      .range([0, sizes.width])
      .clamp(true),
  };

  var axis = {
    x: d3.svg.axis().scale(scale.x).orient("bottom"),
  }
  axisPadding = 1;

  var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });
  var area = d3.svg.area()
    .x( function(d) { return d.x } )
    .y0( function(d) { return sizes.height + sizes.gap } )
    .y1( function(d) { return d.y } );
  var graph = d3.select(".paper[data-paper-id='" + paperId + "'] .bars").append("svg")
    .attr("width", sizes.width + margin.left + margin.right)
    .attr("height", (2 * sizes.height + sizes.gap) + margin.top + margin.bottom)

  var overallBar = graph.append("g")
    .attr("transform", "translate(" + margin.left + "," + 0 + ")")
    .selectAll('rect').data([
      {score: totalPerc, other: false},
      {score: 100 - totalPerc, other: true}
    ])
      .enter().append('rect')
        .attr('x', function(d) { return (d.other) ? scale.overall(totalPerc) : 0;})
        .attr('y', function(d) { return 0;})
        .attr('width', function(d) {
          console.log("Key: " + d.other + "SCORE: " + d.score, scale.overall(d.score));
          return scale.overall(d.score);
        })
        .attr('height', function(d) {
          return sizes.height;
        })
        .style('fill', function(d) {
          return (d.other) ? '#d8d8d8' : '#eeb17e';
        })
        .append("title")
          .text(function(d) {
            var s = (d.other) ? "Other topics: " : "Selected Topics: ";
            s += roundToPlace(d.score, 3) + "%";
            return s;
          });
  graph.append('path').data([[
      {x: 0, y: sizes.height},
      {x: scale.overall(totalPerc), y: sizes.height},
      {x: sizes.width, y: (sizes.height + sizes.gap)}
    ]
  ])
    .attr('transform',"translate(" + margin.left + "," + 0 + ")")
    .style("stroke", "#eeb17e")
    .style("fill", "#ffcc8e")
    .attr('class', 'area')
    .attr('d', area);
  // graph.append('path').data([[
  //   {x: scale.overall(totalPerc), y: sizes.height},
  //   {x: sizes.width, y: (sizes.height + sizes.gap)}
  // ]])
  //   .attr('transform',"translate(" + margin.left + "," + 0 + ")")
  //   .style("stroke", "#eeb17e")
  //   .attr('class', 'line')
  //   .attr('d', line);

  var splitTopics = graph.append("g")
    .attr("transform", "translate(" + margin.left + "," + (sizes.height + sizes.gap) + ")");
    splitTopics.selectAll('rect').data(Object.values(paperData['topics']))
      .enter().append('rect')
        .attr('x', function(d) {return scale.x(shifts[d.key]);})
        .attr('y', 0)
        .attr('width',function(d) {
          console.log("SCORE: " + d.score);
          return scale.x(d.score);
        })
        .attr('height',function(d) {
          return sizes.height;
        })
        .style('fill', function(d) {
          return topics.getColor(d.key);
        })
        .append("title")
          .text(function(d) {
            var s = "Topic " + d.key + ": "
              + roundToPlace(d.score, 3) + "%"
            return s;
          })
  graph.append("g")
    .classed("x axis", true)
    .attr("transform", "translate(" + margin.left + ","+ (2 * sizes.height + sizes.gap) +")")
    .call(axis.x)
    .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "center")
      .attr("dy", "2.5em")
      .attr("x", function(d) {
        return (sizes.width - 40)/ 2;
      })
      .text("% of Newspaper");
}

var updateMapInfo = function(data) {
  $("#map-info div").html("");
  console.log("MAP INFO");
  console.log(data);
  $.each(data, function(loc_id, loc_data) {
    console.log("HERE: " + loc_id)
    var section = "<div class='paper-loc' data-loc='" + loc_id + "'>"
      + "</div>";
    $("#map-info #papers-in-loc").append(section)
    $.each(loc_data.papers, function(paper_id, paper_data) {
      var pieData = getPieData(paper_data);
      var subsection = "<div class='paper' data-paper-id='" + paper_id + "'>"
          + "<h3 class='title'>" + paper_data.title
            + " (" + loc_data.location.city + ")"
          + "</h3>"
          + "<div class='pie'></div>"
          + "<div class='bars'></div>"
        + "</div>";
      var el = $(subsection)[0];
      console.log(el);
      //var pie = new d3pie(el.getElementsByClassName('pie')[0], pieData);
      $("#map-info #papers-in-loc [data-loc='" + loc_id + "']").append(el);
      getPercCompBar(paper_id, paper_data);
    });
  });
}
