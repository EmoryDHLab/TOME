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

appendSlider("#vertical-slide", true);
appendSlider("#horizontal-slide", false,
  [data_start_year - 1, data_end_year - 1]);

d3.select(".vis-no-title")
  .style("min-width", width + $(".vert-slide-wrap").outerWidth(true) + "px");

function updateTopicsSelected(e) {
  $.ajax({
    type : "GET",
    url : topic_data_link,
    data : {
      json_data : JSON.stringify({'topics' : topics.getKeys()})
    },
    success : function(data) {
      console.log("UPDATE");
      console.log(data);
      $("#topic-titles").html("");
      var output = "";
      $.each(data, function(key, val) {
        output = "<span class='topic-title' data-topic='"
          + val.key + "'>TOPIC " + val.key +"</span>";
        $("#topic-titles").append(output);
      });
      if (topics.count > 0) {
        $("#topic-link").addClass("available");
      } else {
        $("#topic-link").removeClass("available").removeClass("active");
      }
    },
    error : function(textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

$("nav").on("click", "li:not(.available) a", function(e){ e.preventDefault() });
$("nav").on("click", "li.available:not(.active) a", function(e){
  $(".active").removeClass("active");
  $(this.parentNode).addClass("active");
});

$(".topic-list").on("mouseover", "li:not(.selected)", function(){
  if (tenMode) {
    //$(this).find("i").css("display","block");
    fadeOutRects(this.dataset.topic);
  } else {
    highlightRects(this.dataset.topic);
  }
});

$(".topic-list").on("mouseout", "li:not(.selected)", function(){
  if (tenMode) {
    unfadeOutRects(this.dataset.topic);
  } else {
    unhighlightRects(this.dataset.topic);
  }
});

$(".topic-list").on("click", "li", function(e) {
  var t = this.dataset.topic;
  var add = ! d3.select(this).classed("selected");
  if (add) {
    addTopicToSelected(this, t);
    updateTopicsSelected(e);
  } else {
    removeTopicFromSelected(this,t);
    updateTopicsSelected(e);
  }
});

$("#clear-selected").on("click", function(e) {
  clearSelected();
  updateTopicsSelected(e);
});
$(".view-ten").click(function(e) {
  switchMode();
});

$(".view-all").click(function(e) {
  switchMode();
});

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
