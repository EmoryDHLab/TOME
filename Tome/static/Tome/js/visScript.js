var rectdata = [];

for ( var i = 0; i < 100; i++) {
  temp = [];
  for ( var j = 0; j < 100; j++) {
    temp.push(j);
  }
  rectdata.push(temp);
}

var vertMax = window.innerHeight - 150,
    horzMax = $(".flex-container").innerWidth() - $(".topics").outerWidth(true);
var height = (vertMax < horzMax) ? vertMax : horzMax,
    width = height,
    offset = width/500,
    m = 100,
    n = 100;

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
  n = 100;
  var mCount = 0,
      nCount = 0;
  $(".out").removeClass("out");
  // if it is vert, then select by data-i
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
      if (mCount%100 == 0){
        m--;
      }
      mCount++;
    }
    if (hn || hx) {
      if (nCount%100 == 0){
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
    .on('mouseover', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: '#000'
          });
    })
    .on('mouseout', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: 'none'
          });
    })

var sThickness = 5;

var sY = d3.scale.linear()
  .domain([0,99])
  .range([0,width])
  .clamp(true);

var dispatch = d3.dispatch('maxChange','minChange', 'rescale');
function appendSlider(selector, vertical = false) {
  var styles = {
    len: 'width',
    thick: 'height',
    class: 'horizontal',
    move: 'left',
    mouse: 0
  }

  var minimumVal = (vertical) ? 99 : 0,
      maximumVal = (vertical) ? 0 : 99;

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
      dispatch.minChange(this,
        sY.invert(d3.mouse(sliderTray.node())[styles.mouse]));
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      dispatch.minChange(this,
        sY.invert(d3.mouse(sliderTray.node())[styles.mouse]));
    })
    .on("dragend", function(){
      updateCorpusChart();
      d3.event.sourceEvent.preventDefault();
    })
  );

  sliderHandleMax.call(d3.behavior.drag()
    .on("dragstart", function(){
      dispatch.maxChange(this,
        sY.invert(d3.mouse(sliderTray.node())[styles.mouse]));
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      dispatch.maxChange(this,
        sY.invert(d3.mouse(sliderTray.node())[styles.mouse]));
    })
    .on("dragend", function(){
      updateCorpusChart();
      d3.event.sourceEvent.preventDefault();
    })
  );
}
dispatch.on('maxChange', function(target, value) {
  value = Math.round(value);
  coreVal = value;
  value = sY(value);
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
      .html(coreVal + 1);
    }
  }
});
dispatch.on('minChange', function(target, value) {
  value = Math.round(value);
  coreVal = value;
  value = sY(value);
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
        .html(coreVal + 1);
    }
  }
});

var corpusSliders = {
  x:{
      maxVal: 99,
      minVal: 0,
      getShift: function(i) {
        return -((100 - n) * getRectWidth() + (99 - n) * offset);
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
appendSlider("#horizontal-slide");

d3.select(".vis-no-title")
  .style("min-width", width + $(".vert-slide-wrap").outerWidth(true) + "px")
