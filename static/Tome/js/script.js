var  mn = document.getElementById("head-nav");
    mns = "head-nav-scrolled";
    hdr = document.getElementsByTagName('header')[0].offsetHeight;
var scrollTop = function() {
  return (window.pageYOffset !== undefined) ? window.pageYOffset :
    (document.documentElement || document.body.parentNode ||
    document.body).scrollTop;}

window.onscroll = function() {
  if( scrollTop() > hdr ) {
    mn.className = mns;
  } else {
    mn.className = "";
  }
};

d3.selectAll(".topic-list")
  .style('height', function() {
    return d3.select("#corpus-chart").style('height');
  })


d3.selectAll(".topic-sort").on('click', function(){
  d3.select(this.parentNode).select('.sort-menu')
    .style("display", function(){
      return (d3.select(this).style("display") == "none") ? "block" : "none";
    });
})
