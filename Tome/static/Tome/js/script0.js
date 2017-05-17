var bardata = [];

for ( var i = 0; i < 50; i++) {
  bardata.push(Math.random()*300);
}

var height = 400,
    width = 600,
    barWidth = 50,
    barOffset = 5;

var yScale = d3.scaleLinear()
  .domain([0, d3.max(bardata)])
  .range([0, height]);

var xScale = d3.scaleBand()
  .domain(d3.range(0, bardata.length))
  .range([0,width]);

var colors = d3.scaleLinear()
  .domain([0, bardata.length*.33, bardata.length*.66, bardata.length])
  .range(['#FFB832', '#C61C6F', '#268BD2','#85992C'])

var tooltip = d3.select('body').append('div')
  .styles({
    position: 'absolute',
    padding : '0 10px',
    background : 'white',
    opacity: 0
  })

var myChart = d3.select('#corpus-vis').append('svg')
  .attrs({
    width: width,
    height: height,
  })
  .style('background', 'C9D7D6')
  .selectAll('rect').data(bardata)
  .enter().append('rect')
    .style('fill', function(d, i) {
      return colors(i);
    })
    .attrs({
      width: xScale.bandwidth(),
      height: 0,
      x: function(d, i) {
        return xScale(i);
      },
      y: function(d, i) {
        return height;
      }
    })
    .on('mouseover',function(d) {
      tooltip.transition()
        .style('opacity',.9)
        tooltip.html(Math.round(d))
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 30) + 'px')
      d3.select(this)
        .style('opacity', .5);
    })
    .on('mouseout',function(d) {
      d3.select(this)
          .style('opacity', 1);
    })

myChart.transition()
  .attrs({
    height: function(d) {
      return yScale(d);
    },
    y: function(d, i) {
      return height - yScale(d);
    }
  })
  .delay(function(d, i) {
    return i * 20;
  })
  .ease(d3.easeElastic);
