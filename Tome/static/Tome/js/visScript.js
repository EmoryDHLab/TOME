var rectdata = [];

for ( var i = 0; i < 100; i++) {
  temp = [];
  for ( var j = 0; j < 100; j++) {
    temp.push(j);
  }
  rectdata.push(temp);
}
var height = 850,
    width = 850,
    offset = 3
    heightOut = 0,
    widthOut = 0;

var getRectWidth = function() {
  console.log(widthOut);
  return (width - ((99 - widthOut) * offset)) / (100 - widthOut);
}
var getRectHeight = function() {
  console.log(heightOut);
  return (height - ((99 - heightOut) * offset)) / (100 - heightOut);
}

var resizeCorpusChart = function() {
  d3.selectAll("#corpus-chart rect")
    .attr("width", getRectWidth())
    .attr("height", getRectHeight())
    .attr("transform", "translate(" + corpusSliders.x.getShift()
      + ", " + corpusSliders.y.getShift() + ")")
}

var updateCorpusChart = function() {
  console.log(corpusSliders);
  heightOut = 0;
  widthOut = 0;
  $(".out").removeClass("out");
  // if it is vert, then select by data-i
  $('rect[data-j]').filter(function () {
    var vx = false, vn = false, hx = false, hn = false;
    var yval = $(this).data('i');
    var xval = $(this).data('j');
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
      heightOut++;
    }
    if (hn || hx) {
      widthOut++;
    }
    return vn || vx || hn || hx;
  }).addClass("out");
  widthOut/=100;
  heightOut/=100;
  resizeCorpusChart();
}

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

  var sliderHandleMax = slider.append("div")
    .attr('class', 'slider-handle max-handle')
    .attr('data-value', (vertical) ? 0 : 99);

  if (vertical) {
    sliderHandleMax.style("top","0");
  } else {
    sliderHandleMax.style("left","100%");
  }

  var sliderHandleMin = slider.append("div")
    .attr('class', 'slider-handle min-handle')
    .attr('data-value', (vertical) ? 99 : 0);
  sliderHandleMax.append("div")
    .attr("class", "slider-handle-icon")
  sliderHandleMin.append("div")
    .attr("class", "slider-handle-icon")

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
    if (value < parseInt(min.style('top').replace("px",""))) {
      corpusSliders.y.maxVal = coreVal;
      d3.select(target).style('top', Math.round(value) + "px")
      updateCorpusChart();
    }
  } else {
    if (value > parseInt(min.style('left').replace("px",""))) {
      corpusSliders.x.maxVal = coreVal;
      d3.select(target).style('left', Math.round(value) + "px")
      updateCorpusChart();
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
    if (value > parseInt(max.style('top').replace("px",""))) {
      corpusSliders.y.minVal = coreVal;
      d3.select(target).style('top', Math.round(value) + "px")
      updateCorpusChart();
    }
  } else {
    if (value < parseInt(max.style('left').replace("px",""))) {
      corpusSliders.x.minVal = coreVal;
      d3.select(target).style('left', Math.round(value) + "px")
      updateCorpusChart();
    }
  }
});

var corpusSliders = {
  x:{
      maxVal: 99,
      minVal: 0,
      getShift: function() {
        return -(this.minVal + 99 - this.maxVal) * (getRectWidth() + offset);
      }
    },
  y:{
      maxVal:0,
      minVal:99,
      getShift: function() {
        return -(this.maxVal + 99 - this.minVal) * (getRectWidth() + offset);
      }
    }
}

appendSlider("#vertical-slide", true);
appendSlider("#horizontal-slide");
