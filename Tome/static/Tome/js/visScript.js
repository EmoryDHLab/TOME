var rectdata = [];

for ( var i = 0; i < 100; i++) {
  temp = [];
  for ( var j = 0; j < 100; j++) {
    temp.push(j);
  }
  rectdata.push(temp);
}
var height = 650,
    width = 650,
    offset = 1.5;

var getRectWidth = function() {
  return (width - (99 * offset))/100;
}
var getRectHeight = function() {
  return (height - (99 * offset))/100;
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
    .attr('class', 'slider-handle max-handle');

  if (vertical) {
    sliderHandleMax.style("top","0");
  } else {
    sliderHandleMax.style("left","100%");
  }

  var sliderHandleMin = slider.append("div")
    .attr('class', 'slider-handle min-handle');
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
  console.log(value);
  value = sY(value);
  var p = d3.select(target.parentNode);
  var min = p.select('.min-handle');
  if (p.classed('vertical')) {
    if (value < parseInt(min.style('top').replace("px",""))) {
      d3.select(target).style('top', Math.round(value) + "px")
    }
  } else {
    if (value > parseInt(min.style('left').replace("px",""))) {
      d3.select(target).style('left', Math.round(value) + "px")
    }
  }
});
dispatch.on('minChange', function(target, value) {
  value = Math.round(value);
  coreVal = value;
  console.log(value);
  value = sY(value);
  var p = d3.select(target.parentNode);
  var max = p.select('.max-handle');
  if (p.classed('vertical')) {
    if (value > parseInt(max.style('top').replace("px",""))) {
      d3.select(target).style('top', Math.round(value) + "px")
    }
    //TODO: implement this function
    //adjustVert(coreVal, true, true);
  } else {
    if (value < parseInt(max.style('left').replace("px",""))) {
      d3.select(target).style('left', Math.round(value) + "px")
    }
  }
});

appendSlider("#vertical-slide", true);
appendSlider("#horizontal-slide");
