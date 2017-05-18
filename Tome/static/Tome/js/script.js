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

var dispatch = d3.dispatch('sliderChange');
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
  var sliderHandleMin = slider.append("div")
    .attr('class', 'slider-handle min-handle');
  sliderHandleMax.append("div")
    .attr("class", "slider-handle-icon")
  sliderHandleMin.append("div")
    .attr("class", "slider-handle-icon")

  sliderHandleMin.call(d3.behavior.drag()
    .on("dragstart", function(){
      dispatch.sliderChange(this,
        sY.invert(d3.mouse(sliderTray.node())[styles.mouse]));
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      dispatch.sliderChange(this,
        sY.invert(d3.mouse(sliderTray.node())[styles.mouse]));
    })
  );

  sliderHandleMax.call(d3.behavior.drag()
    .on("dragstart", function(){
      dispatch.sliderChange(this, sY.invert(d3.mouse(sliderTray.node())[1]));
      d3.event.sourceEvent.preventDefault();
    })
    .on("drag", function() {
      dispatch.sliderChange(this, sY.invert(d3.mouse(sliderTray.node())[1]));
    })
  );
}
dispatch.on('sliderChange', function(target, value) {
  var p = d3.select(target.parentNode);
  if (p.classed('vertical')) {
    d3.select(target).style('top', sY(value) + "px")
  } else {
    d3.select(target).style('left', sY(value) + "px")
  }
})

appendSlider("#vertical-slide", true);
appendSlider("#horizontal-slide");




//
