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

var myChart = d3.select('#corpus-vis').append('svg')
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
