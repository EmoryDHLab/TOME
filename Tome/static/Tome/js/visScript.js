var rectdata = [];
var tenMode = false;

topics = new Topic();
tenTopics = new Topic();

function highlightRects(t) {
  if (topics.full()) {
    return
  }
  d3.selectAll("#corpus-chart rect[data-topic='" + t + "']")
    .attr("fill",topics.nextColor())
    .style("opacity",".5");
}
function unhighlightRects(t) {
  if (topics.full()) {
    return;
  }
  d3.selectAll("#corpus-chart rect[data-topic='" + t + "']")
    .attr("fill",topics.defaultColor)
    .style("opacity","1");
}

function fadeOutRects(t) {
  console.log("FADE");
  d3.selectAll("#corpus-chart rect:not([data-ten-topic='" + t + "']):not(.selected)")
    .style("opacity",".2");
  d3.selectAll("#corpus-chart rect[data-ten-topic='" + t + "']")
    .style("opacity","1");
}
function unfadeOutRects(t) {
  console.log(d3.selectAll("#corpus-chart rect.top-ten:not(.selected)"));
  d3.selectAll("#corpus-chart rect.top-ten:not(.selected)")
    .style("opacity", function() { return (topics.empty()) ? "1" : ".2"; });
}

function updateAllSelected(toTen = true) {
  var selectedInList = d3.selectAll("#corpus-topics li.selected")[0];
  if (toTen){
    selectedInList = d3.selectAll("#corpus-ten-topics li.selected")[0];
  }
  // if it's in the list as selected, but not selected
  for (var i = 0; i < selectedInList.length; i++) {
    var el = selectedInList[i];
    if (!topics.contains(el.dataset.topic)) {
      console.log("NOT SELECTED NOW:", el.dataset.topic);
      updateSelected(el.dataset.topic);
    }
  }
  // if it's selected, but not in the list
  for (var i = 0; i < topics.getSelected().length; i++) {
    var topic = topics.getSelected()[i];
    if (d3.selectAll("li[data-topic = '"+ topic +"']").length == 2)
    updateSelected(topic);
  }
}

function updateSelected(topic) {
  if (topic == undefined) return;
  var targets = d3.selectAll("li[data-topic = '"+ topic +"']");
  var add = !targets.classed("selected");
  var ten = "";
  if (tenMode) {
    ten = "ten-"
  }
  if (add) {
    targets.classed("selected", true)
    .selectAll(".color-box")
      .style("background-color", function() {
        if ((this.parentNode.parentNode.id == "corpus-ten-topics")) {
          return d3.select(this).style("background-color");
        }
        return topics.nextColor();
      })
      .selectAll("i")
        .style("display", "block");
    d3.selectAll("#corpus-chart rect[data-" + ten + "topic='" + topic + "']")
      .attr("fill", function() {
        if (tenMode) {
          return d3.select(this).attr("fill");
        }
        return topics.nextColor();
      })
      .classed("selected", true)
      .style("opacity", "1");
  } else {
    targets.classed("selected", false)
      .select(".color-box")
        .attr("style", function() {
          if (this.parentNode.parentNode.id == "corpus-ten-topics") {
            return d3.select(this).attr("style");
          }
          return null;
        })
        .select("i")
          .style("display","none");
    var rects =
      d3.selectAll("#corpus-chart rect[data-" + ten + "topic='" + topic + "']");
    rects.attr("fill",function() {
      return (tenMode) ? d3.select(this).attr("fill") : "#d8d8d8";
    })
      .classed("selected", false)
      .style("opacity", "1");
  }
}

function addTopicToSelected(target, topic) {
  console.log("add");
  if (topics.full()) {
    alert("You may only select up to 10 topics.")
    return;
  }
  updateSelected(topic);
  topics.add(topic);
}

function removeTopicFromSelected(target, topic) {
  console.log("remove");
  updateSelected(topic);
  topics.deleteSelected(topic);
}

function clearSelected() {
  var query = "#corpus-topics li.selected";
  if (tenMode) {
    query = "#corpus-ten-topics li.selected"
  }
  d3.selectAll(query).each(function(){
    removeTopicFromSelected(this,this.dataset.topic);
  });
}

for (i = data_start_year; i < data_end_year+1; i++) {
  rectdata.push(topic_data[i])
}

var vertMax = window.innerHeight - 150,
    horzMax = $(".flex-container").innerWidth() - $(".topics").outerWidth(true);
var height = (vertMax < horzMax) ? vertMax : horzMax,
    width = height,
    offset = {
      x : width/500,
      y : height/500
    },
    m = 100,
    n = data_n_range;

var getRectWidth = function() {
  return (width - (offset.x * (n - 1))) / n;
}

var getRectHeight = function() {
  return (height - (offset.y * (m - 1))) / m;
}

var resizeCorpusChart = function() {
  d3.selectAll("#corpus-chart rect:not(.out)")
    .attr("width", getRectWidth())
    .attr("height", getRectHeight())
    .attr("x", function(){
      var j = gridMap.get(this.id).j;
      var newJ = j - corpusSliders.x.minVal;
      return newJ * (getRectWidth() + offset.x);
    })
    .attr("y", function(){
      var i = gridMap.get(this.id).i;
      var newI = i - corpusSliders.y.maxVal;
      return newI * (getRectHeight() + offset.y);
    })
}

var updateCorpusChart = function() {
  m = 100;
  n = data_n_range;
  var mCount = 0,
      nCount = 0;
  $(".out").removeClass("out");
  $('rect[data-j]').filter(function () {
    var vx = false, vn = false, hx = false, hn = false;
    var yval = gridMap.get(this.id).i;
    var xval = gridMap.get(this.id).j;
    if (yval > corpusSliders.y.minVal) {
      vn = true;
    }
    if (yval < corpusSliders.y.maxVal) {
      vx = true;
    }
    if (xval > corpusSliders.x.maxVal) {
      hx = true;
    }
    if (xval < corpusSliders.x.minVal) {
      hn = true;
    }
    if (vn || vx) {
      if (mCount % data_n_range == 0){
        m--;
      }
      mCount++;
    }
    if (hn || hx) {
      if (nCount % 100 == 0){
        n--;

      }
      nCount++;
    }
    return vn || vx || hn || hx;
  }).addClass("out");
  resizeCorpusChart();
}
var gridMap = new Map();
var myChart = d3.select('#corpus-chart').append('svg')
  .attr({
    height: height,
    width: width,
  })
  .selectAll('g').data(rectdata)
  .enter().append('g')
  .selectAll('rect').data(function(d) { return d; })
  .enter().append('rect')
    .attr({
      width: getRectWidth(),
      height: getRectHeight(),
      fill: '#d8d8d8',
      id: function(d, i, j) {
        var idTemp = "i" + i + "-j" + j;
        gridMap.put(idTemp,{ i:i, j:j })
        return idTemp;
      },
      x: function(d, i, j) {
        return j * (getRectWidth() + offset.x);
      },
      y: function(d, i, j) {
        return i * (getRectHeight() + offset.y);
      },
    })
    .attr('data-i', function(d,i,j) {
      return i;
    })
    .attr('data-j', function(d, i, j) {
      return j;
    })
    .attr('data-year', function(d, i, j) {
      return j + data_start_year;
    })
    .attr('data-topic', function(d, i, j) {
      return d.topic;
    })
    .on('mouseover', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: '#000'
          });
        if (!d3.select(this).classed("selected") && !tenMode){
          highlightRects(this.dataset.topic);
        }
        if (tenMode) {
          fadeOutRects(this.dataset.tenTopic);
        }
    })
    .on('mouseout', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: 'none'
          });
        if (!d3.select(this).classed("selected") && !tenMode){
          unhighlightRects(this.dataset.topic);
        }
        if (tenMode) {
          unfadeOutRects(this.dataset.tenTopic);
        }
    });

$('rect[data-j]').filter(function(){
  return (this.dataset.i<10);
}).addClass("top-ten");

d3.selectAll(".top-ten")
  .attr("data-ten-topic","N/A")

var sThickness = 5;

var sX = d3.scale.linear()
  .domain([0,data_n_range - 1])
  .range([0,width])
  .clamp(true);

var sY = d3.scale.linear()
  .domain([0,99])
  .range([0,height])
  .clamp(true);

var TEST = undefined;

var dispatch = d3.dispatch('maxChange','minChange', 'rescale');
function appendSlider(selector, vertical = false, slideRange=[0,99]) {
  var styles = {
    len: 'width',
    thick: 'height',
    class: 'horizontal',
    move: 'left',
    mouse: 0
  }

  var minimumVal = (vertical) ? slideRange[1] : slideRange[0],
      maximumVal = (vertical) ? slideRange[0] : slideRange[1];

  if (vertical) {
    styles.move = 'top';
    styles.len = 'height';
    styles.thick = 'width';
    styles.class ='vertical';
    styles.mouse = 1;
  }
  var slider = d3.select(selector)
    .classed(styles.class, true)

  var sliderTray = slider.append("div")
    .attr('class',"slider-tray")
    .style(styles.len, width + 'px')
    .style(styles.thick, sThickness + 'px');

  var rangeBar = sliderTray.append("div")
    .attr('class', 'range-bar')
    .style(styles.len, width + 'px')
    .style(styles.thick, sThickness + 'px');

  var sliderHandleMax = slider.append("div")
    .attr('class', 'slider-handle max-handle')
    .attr('data-value', maximumVal);

  if (vertical) {
    sliderHandleMax.style("top","0");
  } else {
    sliderHandleMax.style("left","100%");
  }

  var sliderHandleMin = slider.append("div")
    .attr('class', 'slider-handle min-handle')
    .attr('data-value', minimumVal);

  sliderHandleMax.append("div")
    .attr("class", "slider-handle-icon")
  sliderHandleMax.append("div")
    .attr("class", "slider-handle-label")
    .html(maximumVal + 1);

  sliderHandleMin.append("div")
    .attr("class", "slider-handle-icon");
  sliderHandleMin.append("div")
    .attr("class", "slider-handle-label")
    .html(minimumVal + 1);

  sliderHandleMin.call(d3.behavior.drag()
    .on("dragstart", function(){
      var vert = this.parentNode.classList.contains("vertical");
      var scl = (vert) ? sY : sX;
      dispatch.minChange(this,
        scl.invert(d3.mouse(sliderTray.node())[styles.mouse]),
        scl);
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      var vert = this.parentNode.classList.contains("vertical");
      var scl = (vert) ? sY : sX;
      dispatch.minChange(this,
        scl.invert(d3.mouse(sliderTray.node())[styles.mouse]),
        scl);
    })
    .on("dragend", function(){
      updateCorpusChart();
      d3.event.sourceEvent.preventDefault();
    })
  );

  sliderHandleMax.call(d3.behavior.drag()
    .on("dragstart", function(){
      var vert = this.parentNode.classList.contains("vertical");
      var scl = (vert) ? sY : sX;
      dispatch.maxChange(this,
        scl.invert(d3.mouse(sliderTray.node())[styles.mouse]),
        scl);
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      var vert = this.parentNode.classList.contains("vertical");
      var scl = (vert) ? sY : sX;
      dispatch.maxChange(this,
        scl.invert(d3.mouse(sliderTray.node())[styles.mouse]),
        scl);
    })
    .on("dragend", function(){
      updateCorpusChart();
      d3.event.sourceEvent.preventDefault();
    })
  );
}
dispatch.on('maxChange', function(target, value, scl) {
  value = Math.round(value); //round the value
  coreVal = value; // save it to a temp
  value = scl(value);
  d3.select(target).attr('data-value', coreVal);
  var p = d3.select(target.parentNode);
  var min = p.select('.min-handle');
  if (p.classed('vertical')) {
    var mnVal = parseInt(min.style('top').replace("px",""));
    if (value < mnVal) {
      corpusSliders.y.maxVal = coreVal;
      d3.select(target).style('top', Math.round(value) + "px");
      p.select(".range-bar").style('top', Math.round(value) + "px")
        .style('height', Math.abs(mnVal - value) + 'px');
      d3.select(target).select(".slider-handle-label")
      .html(coreVal + 1);
    }
  } else {
    var mnVal = parseInt(min.style('left').replace("px",""));
    if (value > mnVal) {
      corpusSliders.x.maxVal = coreVal;
      d3.select(target).style('left', Math.round(value) + "px")
      p.select(".range-bar").style('left', Math.round(mnVal) + "px")
        .style('width', Math.abs(mnVal - value) + "px");
      d3.select(target).select(".slider-handle-label")
      .html(corpusSliders.x.getAdjustedMax());
    }
  }
});
dispatch.on('minChange', function(target, value, scl) {
  value = Math.round(value);
  coreVal = value;
  value = scl(value);
  d3.select(target).attr('data-value', coreVal);
  var p = d3.select(target.parentNode);
  var max = p.select('.max-handle');
  if (p.classed('vertical')) {
    mxVal = parseInt(max.style('top').replace("px",""));
    if (value > mxVal) {
      corpusSliders.y.minVal = coreVal;
      d3.select(target).style('top', Math.round(value) + "px");
      p.select(".range-bar").style('top', Math.round(mxVal) + "px")
        .style('height', Math.abs(mxVal - value) + 'px');
      d3.select(target).select(".slider-handle-label")
        .html(coreVal + 1);
    }
  } else {
    var mxVal = parseInt(max.style('left').replace("px",""));
    if (value < mxVal) {
      corpusSliders.x.minVal = coreVal;
      d3.select(target).style('left', Math.round(value) + "px");
      p.select(".range-bar").style('left', Math.round(value) + "px")
        .style('width', Math.abs(mxVal - value) + "px");
      d3.select(target).select(".slider-handle-label")
        .html(corpusSliders.x.getAdjustedMin());
    }
  }
});

var corpusSliders = {
  x:{
      shift: data_start_year,
      maxVal: data_n_range - 1,
      minVal: 0,
      getAdjustedMin: function(){ return this.shift + this.minVal; },
      getAdjustedMax: function(){ return this.shift + this.maxVal; },
      getShift: function(i) {
        return -((data_n_range - n) * getRectWidth()
          + (data_n_range - 1 - n) * offset.x);
      }
    },
  y:{
      maxVal:0,
      minVal:99,
      getShift: function(i) {
        return 0;
      }
    }
}

function switchMode(){
  tenMode = !tenMode;

  //clear all colors
  d3.selectAll("#corpus-chart rect")
    .attr("fill", topics.defaultColor)
    .selectAll(".top-ten")
    .attr("data-ten-topic", "N/A");

  // recolor based on new mode
  if (tenMode) {
    viewTenInit();
    var tenTopicsList = getTenTopicsWithSelected();
    console.log(tenTopicsList);
    populateViewTen(topics.getSelectedAsTopics(allTopicList));
    useTenList(topics.getSelectedAsTopics(allTopicList));
  } else {
    viewAllInit();
    populateViewAll();
    useAllList();
  }
}

function getTenTopicsWithSelected() {
  if (topics.full()) {
    return [];
  } else {
    var remaining = 10 - topics.count;
    var temptTList = allTopicList.filter(function(t) {
      return !topics.contains(t.key);
    });
    return temptTList.slice(0, remaining);
  }
}

function setVertRange(start, end) {
  var vert = document.getElementById("vertical-slide");
  var minH = vert.getElementsByClassName("min-handle")[0];
  var maxH = vert.getElementsByClassName("max-handle")[0];
  var scl = sY;
  var mouse = 1;
  dispatch.maxChange(maxH, start, scl);
  dispatch.minChange(minH, end, scl);
}

function viewTenInit(e) {
  console.log(topics.selected);
  offset.y *= 10;
  setVertRange(0,9);
  updateCorpusChart();
  d3.select('.chart-title').text("Top Ten Topics");
  d3.select("#corpus-topics").classed(".ten-mode", true);
  d3.select(".view-ten").style("display","none");
  d3.select(".view-all").style("display","inline-block");
  d3.select("#vertical-slide").style("display","none");
  d3.select("#top-ten")
    .style("display","block")
    .selectAll("p")
      .style("height", function() {
        return getRectHeight() + "px";
      })
      .style("line-height", function() {
        return getRectHeight() + "px";
      })
      .style("margin-bottom", function() {
        return offset.y + "px";
      })
}
function viewAllInit(e) {
  var tempSelect = topics.getSelected();
  offset.y = offset.x;
  setVertRange(0, 99);
  updateCorpusChart();
  d3.select('.chart-title').text("Topics ranked by % of entire corpus");
  d3.select(".view-ten").style("display", "inline-block");
  d3.select(".view-all").style("display", "none");
  d3.select("#vertical-slide").style("display", "block");
  d3.select("#top-ten").style("display", "none");
  d3.selectAll("#corpus-chart rect").style("opacity", "1");
}

function getRelativeRanks(keys) {
  var tenByYr = []
  // each year in topic data
  $.each(topic_data, function(k, v) {
    tempArr = [];
    //each key in the keys array
    $.each(keys, function(index, value) {
      tempArr.push({
        topic : value,
        // get the rank as the index of the key in the overall values list
        rank : v.indexOf(v.find(function(t) {return t.topic == value }))
      });
    })
    tempArr = tempArr.sort(function(a, b) {
      return a.rank - b.rank;
    });
    tenByYr.push(tempArr);
  });
  return tenByYr;
}
// keys are the keys ofcurrently selected topics, if < 10,
//   remaining will be filled with other topics
function populateViewTen(topicArr) {
  if (topicArr.length > 10) { console.log("ERROR"); return; }
  tenTopics.copyFrom(topicArr.map(function(t) {
    return t.key;
  }));
  if (topicArr.length < 10) {
    topicArr = topicArr.concat(getTenTopicsWithSelected());
  }
  var keys = topicArr.map(function(t) {
    return t.key;
  })
  tenTopics.addAll(keys);
  relRanks = getRelativeRanks(keys);
  console.log(relRanks);
  d3.selectAll("rect[data-ten-topic]")
    .attr("data-ten-topic", function() {
      return relRanks[this.dataset.j][this.dataset.i].topic;
    })
    .attr("fill", function() {
      return tenTopics.getColor(relRanks[this.dataset.j][this.dataset.i].topic);
    })
    .classed("selected", function(d) {
      return topics.contains(relRanks[this.dataset.j][this.dataset.i].topic);
    })
    .style("opacity", function() {
      if (topics.contains(relRanks[this.dataset.j][this.dataset.i].topic)
        || topics.empty()) {
        return "1";
      }
      return "0.2";
    })
}

function populateViewAll() {
  d3.selectAll("rect[data-topic]").filter(function() {
    return topics.contains(this.dataset.topic);
  })
    .attr("fill",function() {
      return topics.getColor(this.dataset.topic);
  })
}

function useAllList() {
  d3.select("#corpus-ten-topics").style("display","none");
  d3.select("#corpus-topics").style("display","block");
  updateAllSelected();
}

function createTenList(keys) {
  if (keys.length < 10) {
    keys = keys.concat(getTenTopicsWithSelected());
  }
  var list = d3.select("#corpus-ten-topics");
    list.style("display","block")
    .selectAll("li").data(keys)
    .enter().append("li")
      .attr("data-topic", function(d) {
        return d.key;
      })
      .classed("selected", function(d) {
        return topics.contains(d.key);
      })
      .style("height", function() {
        return getRectHeight() + "px";
      })
      .style("margin-bottom", function() {
        return offset.y + "px";
      })
      .append("span")
        .classed("color-box", true)
        .style("background-color", function(d){
          return (tenTopics.getColor(d.key));
        })
        .append("i")
          .classed("fa fa-exchange", true)
          .attr("aria-hidden", true)
          .style("display", function(d) {
            return (topics.contains(d.key)) ? "block" : "none";
          });
  d3.selectAll("#corpus-ten-topics li")
    .append("p")
      .classed("topic-words", true)
      .style("line-height", function(){
        return (getRectHeight()-10)/3 + "px";
      })
      .text(function(d) { return d.desc });
}

function useTenList(topicArr) {
  if (topicArr.length < 10) {
    topicArr = topicArr.concat(getTenTopicsWithSelected());
  }
  console.log("!!!!!", topicArr);
  d3.select("#corpus-topics").style("display","none");
  if (d3.select("#corpus-ten-topics").text() == "") createTenList(topicArr);
  var list = d3.select("#corpus-ten-topics");
    list.style("display","block")
    .selectAll("li").data(topicArr)
      .attr("data-topic", function(d) {
        return d.key;
      })
      .select(".color-box")
        .style("background-color", function(d){
          return tenTopics.getColor(d.key);
        })
        .select("i")
          .style("display", function(d) {
            return (topics.contains(d.key)) ? "block" : "none";
          })
  d3.selectAll("#corpus-ten-topics li .topic-words").data(topicArr)
    .text(function(d) { return d.desc });
}

function switchTopic(key) {
  alert("Switching topics not yet implemented");
}

//----------------------------TOPIC DETAILS VIS---------------------------------

//VIS 1
function getVisData(keys) {
  var dataTMP = [];
  //for each key
  $.each(keys, function(k ,v) {
    // for each year
    var temp = []
    $.each(rectdata, function(key, tops) {
      temp = temp.concat(tops.filter(function(t) { return t.topic == v}))
    });
    dataTMP.push(temp);
  });
  return dataTMP;
}

function createTopicOverTimeVis(keys) {
  if (keys.length == 0){
    d3.select("#topic-score-chart svg").style("display","none");
    return;
  }
  d3.select("#topic-score-chart").html("");
  d3.select("#topic-score-chart svg").style("display","block");
  var visData = getVisData(keys);
  var margin = {top: 30, right: 30, bottom: 30, left: 50};

  var sizes = {
    width : 600 - margin.left - margin.right,
    height : 500 - margin.bottom - margin.top
  }

  var scale = {
    x: d3.scale.linear()
    .domain([data_start_year, data_end_year])
    .range([0, sizes.width])
    .clamp(true),

    y: d3.scale.linear()
    .domain([d3.max(visData, function(tops) {
      return d3.max(tops, function(t) {
        return t.score;
      })
    }), 0])
    .range([0, sizes.height])
    .clamp(true),

    yPerc: d3.scale.linear()
    .domain([d3.max(visData, function(tops) {
      return d3.max(tops, function(t) {
        return t.score;
      })
    }), 0])
    .range([0, sizes.height])
    .clamp(true),
  };
  var axis = {
    x: d3.svg.axis().scale(scale.x).orient("bottom").tickFormat(d3.format("d")),
    y: d3.svg.axis().scale(scale.yPerc).orient("left").ticks(10)
  }
  var line = d3.svg.line()
  .x(function(d) { return scale.x(d.year); })
  .y(function(d) { return scale.y(d.score); })
  .interpolate("linear");

  var graph = d3.select("#topic-score-chart").append("svg").data(visData)
  .attr("width", sizes.width + margin.left + margin.right)
  .attr("height", sizes.height + margin.top + margin.bottom);
  var g = graph.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  $.each(visData, function(key,value) {
    g.append("path")
    .attr("fill", "none")
    .attr("stroke", function(d) { return topics.getColor(value[0].topic) })
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line(value));
  })
  g.append("g").call(axis.y);
  g.append("g")
    .attr("transform", "translate( 0,"+ sizes.height +")")
    .call(axis.x);
}

// RANK CHANGE OVER TIME

function getDeltaRankData(keys) {
  // returns a list of topics lists, each one with a delta rank based on it's
  var data = [];
  $.each(keys, function(i, key) {
    var tData = [];
    var prevTRank;
    $.each(topic_data, function(yr, tops) {
      var currentTop = tops.find(function(t) { return t.topic == key });
      console.log(currentTop);
      if (prevTRank == undefined) {
        prevTRank = currentTop.rank;
      }
      var t = {
        key: key,
        year: yr,
        change: prevTRank - currentTop.rank,
      }
      prevTRank = currentTop.rank;
      tData.push(t);
    })
    data.push(tData);
  });
  return data;
}

function createDeltaRankChart(keys) {
  console.log(keys);
  if (keys.length == 0){
    d3.select("#topic-rank-charts").style("display","none");
    return;
  } else {
    d3.select("#topic-rank-charts").style("display","block");

  }
  d3.select("#topic-rank-charts").html("");
  var visData = getDeltaRankData(keys);
  var margin = {top: 30, right: 30, bottom: 30, left: 50};

  var sizes = {
    width : 600 - margin.left - margin.right,
    height : 500 - margin.bottom - margin.top
  }

  var scale = {
    x: d3.scale.linear()
    .domain([data_start_year, data_end_year])
    .range([0, sizes.width])
    .clamp(true),

    color: function(change) {
      var red = "#d0011b",
          green = "#417505";
      opacities = [.25, .5, .75, 1]
      style = {
        fill : "#d8d8d8",
        opacity : opacities[Math.floor((Math.abs(change)-1)/25)]
      }
      if (change < 0) {
        style.fill = red;
      } else if (change > 0) {
        style.fill = green;
      } else {
        style.opacity = 1;
      }
      return style;
    }
  };
  var offset = {
    x: sizes.width / 100,
    y: sizes.height / (keys.length * 10)
  }
  var axis = {
    x: d3.svg.axis().scale(scale.x).orient("bottom").tickFormat(d3.format("d")),
  }

  var graph = d3.select("#topic-rank-charts").append("svg").data(visData)
  .attr("width", sizes.width + margin.left + margin.right)
  .attr("height", sizes.height + margin.top + margin.bottom);
  var g = graph.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  g.selectAll('g').data(visData)
    .enter().append('g')
    .selectAll('rect').data(function(d) { return d; })
      .enter().append('rect')
        .attr("width", function() {//width - (offset.x * (n - 1))) / n
          return (sizes.width - (offset.x * (data_n_range - 1))) / data_n_range;
        })
        .attr("height", function() {
          return (sizes.height - (offset.y
            * (keys.length - 1)))/ keys.length;
        })
        .attr("x", function(d, i) {
          console.log(sizes.width);
          return i * (((sizes.width - (offset.x
            * (data_n_range - 1))) / data_n_range) + offset.x);
        })
        .attr("y", function(d, i, j) {
          console.log(j);
          return j * (((sizes.height - (offset.y
            * (keys.length - 1))) / keys.length) + offset.y);
        })
        .attr("fill", function(d) { return scale.color(d.change).fill; })
        .style("opacity", function(d) { return scale.color(d.change).opacity;})

}
