var rectdata = []

topics = {
  count : 0,
  colors : [
    "#d0011b", //red
    "#f6a623", //orange
    "#8b572a", //brown
    "#4990e2", //blue
    "#bd0fe1", //violet
    "#f33dd3", //pink
    "#417505", //green
    "#9012fe", //purple
    "#7ed321", //light-green
    "#50e3c2"  //teal?
  ],
  defaultColor : "#d8d8d8",
  selected : [],
  addToSelected: function(k) {
    if (this.selected.indexOf(k) != -1) {
      console.log("Already in it.");
      return;
    }
    if (this.count == 10){
      console.log("Too many.");
      return;
    }
    if (this.count < this.selected.length){
      for (i = 0; i < this.selected.length; i++) {
        if (this.selected[i] == undefined) {
          this.selected[i] = k;
          console.log("placed");
          break;
        }
      }
    } else {
      console.log("placed");
      this.selected.push(k);
    }
    this.count++;
    return this.colors[this.count - 1];
  },
  full: function() {
    return this.count == 10;
  },
  nextColor: function() {
    ind = 0;
    if (this.count < this.selected.length){
      for (i = 0; i < this.selected.length; i++) {
        if (this.selected[i] == undefined) {
          ind = i;
          break;
        }
      }
    } else {
      ind = this.count;
    }
    return this.colors[ind];
  },
  removeSelected: function(k) {
    i = this.selected.indexOf(k);
    console.log(i);
    if (i > -1) {
        this.selected[i] = undefined;
        this.count--;
    }
  }
}

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
    return
  }
  d3.selectAll("#corpus-chart rect[data-topic='" + t + "']")
    .attr("fill",topics.defaultColor)
    .style("opacity","1");
}

function addTopicToSelected(target, topic) {
  if (topics.full()) {
    alert("You may only select up to 10 topics.")
    return;
  }
  console.log("add");
  d3.select(target).classed("selected", true)
    .select(".color-box")
      .style("background-color", topics.nextColor());
  d3.selectAll("#corpus-chart rect[data-topic='" + topic + "']")
    .attr("fill",topics.nextColor())
    .classed("selected",true)
    .style("opacity","1");
  topics.addToSelected(topic);
}

function removeTopicFromSelected(target, topic) {
  console.log(target);
  console.log("remove");
  d3.select(target)
    .classed("selected", false)
    .select(".color-box")
      .attr("style", null)
      .style("background-color", "transparent");
  d3.selectAll("#corpus-chart rect[data-topic='" + topic + "']")
    .attr("fill","#d8d8d8")
    .classed("selected", false)
    .style("opacity","1");
  topics.removeSelected(topic);
}

for (i = data_start_year; i < data_end_year+1; i++) {
  rectdata.push(topic_data[i])
}

var vertMax = window.innerHeight - 150,
    horzMax = $(".flex-container").innerWidth() - $(".topics").outerWidth(true);
var height = (vertMax < horzMax) ? vertMax : horzMax,
    width = height,
    offset = width/500,
    m = 100,
    n = data_n_range;

var getRectWidth = function() {
  return (width - (offset * (n - 1))) / n;
}

var getRectHeight = function() {
  return (height - (offset * (m - 1))) / m;
}

var resizeCorpusChart = function() {
  d3.selectAll("#corpus-chart rect:not(.out)")
    .attr("width", getRectWidth())
    .attr("height", getRectHeight())
    .attr("x", function(){
      var j = gridMap.get(this.id).j;
      var newJ = j - corpusSliders.x.minVal;
      return newJ * (getRectWidth() + offset);
    })
    .attr("y", function(){
      var i = gridMap.get(this.id).i;
      var newI = i - corpusSliders.y.maxVal;
      return newI * (getRectHeight() + offset);
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
var gridMap = new Map;
var myChart = d3.select('#corpus-chart').append('svg')
  .attr({
    height: height,
    width: width,
  })
  .selectAll('g').data(rectdata)
  .enter().append('g')
  .selectAll('rect').data(function(d, i) { return d; })
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
        return j * (getRectWidth() + offset);
      },
      y: function(d, i, j) {
        return i * (getRectHeight() + offset);
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
      return d;
    })
    .on('mouseover', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: '#000'
          });
        if (!d3.select(this).classed("selected")){
          highlightRects(this.dataset.topic);
        }
    })
    .on('mouseout', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: 'none'
          });
        if (!d3.select(this).classed("selected")){
          unhighlightRects(this.dataset.topic);
        }
    });

$('rect[data-j]').filter(function(){
  return (this.dataset.j<10 && this.dataset.i<10);
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
          + (data_n_range - 1 - n) * offset);
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

appendSlider("#vertical-slide", true);
appendSlider("#horizontal-slide",false, [data_start_year-1,data_end_year-1]);

d3.select(".vis-no-title")
  .style("min-width", width + $(".vert-slide-wrap").outerWidth(true) + "px");

$("#corpus-topics").on("mouseover", "li:not(.selected)", function(){
  highlightRects(this.dataset.topic);
});

$("#corpus-topics").on("mouseout", "li:not(.selected)", function(){
  unhighlightRects(this.dataset.topic);
});

$("#corpus-topics li").on("click", function() {
  var t = this.dataset.topic;
  var add = ! d3.select(this).classed("selected");
  if (add) {
    addTopicToSelected(this,t);
  } else {
    removeTopicFromSelected(this,t);
  }
});

$("#clear-selected").on("click", function() {
  for (var i = 0; i < topics.selected.length; i++) {
    if (topics.selected[i] != undefined) {
      target = d3.select(".topic-list li[data-topic='"
        + topics.selected[i] +"']")[0][0];
      console.log(target);
      removeTopicFromSelected(target, topics.selected[i]);
    }
  }
});

function setVertRange(start, end) {
  var vert = document.getElementById("vertical-slide");
  var minH = vert.getElementsByClassName("min-handle")[0];
  var maxH = vert.getElementsByClassName("max-handle")[0];
  var scl = sY;
  var mouse = 1;
  dispatch.maxChange(maxH, start, scl);
  dispatch.minChange(minH, end, scl);
}

function viewTenSwitch(e) {
  setVertRange(0,9);
  updateCorpusChart();
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
        return offset + "px";
      })
}
function viewAllSwitch(e) {
  setVertRange(0,99);
  updateCorpusChart();
  d3.select(".view-ten").style("display","inline-block");
  d3.select(".view-all").style("display","none");
  d3.select("#vertical-slide").style("display","block");
  d3.select("#top-ten").style("display","none");
}
