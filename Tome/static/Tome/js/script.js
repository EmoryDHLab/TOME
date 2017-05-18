var bardata = [];

for ( var i = 0; i < 100; i++) {
  temp = [];
  for ( var j = 0; j < 100; j++) {
    temp.push(j);
  }
  bardata.push(temp);
}

var height = 700,
    width = 700,
    side = 5,
    offset = 2;

var myChart = d3.select('#corpus-chart').append('svg')
  .attr({
    height: height,
    width: width,
  })
  .selectAll('g').data(bardata)
  .enter().append('g')
  .selectAll('rect').data(function(d, i) { return d; })
  .enter().append('rect')
    .attr({
      width: side,
      height: side,
      fill: '#d8d8d8',
      x: function(d, i, j) {
        return j * (side + offset);
      },
      y: function(d, i, j) {
        return i * (side + offset);
      }
    })
    .on('mouseover', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: '#000'
          })
    })
    .on('mouseout', function(d, i, j) {
        d3.select(this)
          .attr({
            stroke: 'none'
          })
    })

var sLength = 700,
    sThickness = 5;

var sY = d3.scale.linear()
  .domain([1,100])
  .range([0,sLength])
  .clamp(true);

var dispatch = d3.dispatch('maxChange','minChange');
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
    .style(styles.len, sLength + 'px')
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
  value = sY(value);
  var p = d3.select(target.parentNode);
  var min = p.select('.min-handle');
  console.log(min);
  if (p.classed('vertical')) {
    console.log(value,min.style('top'))
    if (value < parseInt(min.style('top').replace("px",""))) {
      d3.select(target).style('top', Math.round(value) + "px")
    }
  } else {
    console.log(value,min.style('left'))
    if (value > parseInt(min.style('left').replace("px",""))) {
      d3.select(target).style('left', Math.round(value) + "px")
    }
  }
})
dispatch.on('minChange', function(target, value) {
  value = sY(value);
  var p = d3.select(target.parentNode);
  var max = p.select('.max-handle');
  if (p.classed('vertical')) {
    console.log(value,max.style('top'))
    if (value > parseInt(max.style('top').replace("px",""))) {
      d3.select(target).style('top', Math.round(value) + "px")
    }
  } else {
    if (value < parseInt(max.style('left').replace("px",""))) {
      d3.select(target).style('left', Math.round(value) + "px")
    }
  }
})
appendSlider("#vertical-slide", true);
appendSlider("#horizontal-slide");




//
