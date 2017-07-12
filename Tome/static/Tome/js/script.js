var nextArticle = 0;
var LOADING = false;

var sortOpen = false;
var sortMode = 0;

var  mn = document.getElementById("head-nav");
    mns = "head-nav-scrolled";
    hdr = document.getElementsByTagName('header')[0].offsetHeight;
var scrollTop = function() {
  return (window.pageYOffset !== undefined) ? window.pageYOffset :
    (document.documentElement || document.body.parentNode ||
    document.body).scrollTop;}

function arrToString(arr, ct=-1) {
  var s = "";
  if (ct != -1) {
    var truncateAfter = ct;
  } else {
    var truncateAfter = arr.length;
  }
  for (var i = 0; i < truncateAfter; i++) {
      s += arr[i].word;
      s += (i < truncateAfter - 1 ) ? ", ": "";
  }
  return s;
}

window.onscroll = function() {
  if( scrollTop() >= hdr ) {
    mn.className = mns;
  } else {
    mn.className = "";
  }
  if($(window).scrollTop() + $(window).height() >= $(document).height() - 200) {
    if(!topics.empty() && (nextArticle != 0) && !LOADING) {
      startMiniLoad();
      loadAdditionalArticles();
    }
  }
};

appendSlider("#vertical-slide", true);
appendSlider("#horizontal-slide", false,
  [data_start_year - 1, data_end_year - 1]);

d3.select(".vis-no-title")
  .style("min-width", width + $(".vert-slide-wrap").outerWidth(true) + "px");

function startLoad() {
  $("#loader").css("display","block");
}
function endLoad() {
  $("#loader").css("display","none");
}

function startMiniLoad() {
  LOADING = true;
  console.log("startMiniLoad");
  $(".miniload").css("display","block");
}
function endMiniLoad() {
  LOADING = false;
  console.log("stopMiniLoad");
  $(".miniload").css("display","none");
}

function updateTopicsSelected(e) {
  // startLoad();
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
      var output = "",
          words = "";
      window.TEST=data;

      $.each(data, function(key, val) {
        output += "<span class='topic-title' data-topic='"
          + val.key + "'>"
        if (topics.count == 1) {
          output += "<div class='color-box' style='background-color:"
            + topics.getColor(val.key) + "'>&nbsp;&nbsp;&nbsp;</div>";
          words = arrToString(val.words.slice(0,10));
        }
        output += "<span>TOPIC " + val.key + "</span>";
        output += (words != "") ? "<span class='topic-words'>&ndash;&nbsp;"
          + words + "</span>" : "";
        output += "</span>";
        $("#topic-titles").append(output);
        output = "";
      });
      if (topics.count > 0) {
        d3.select("#topic-details").style("display","block");
        d3.select("#document-details").style("display","block");
        $("#topic-link").addClass("available");
        $("#document-link").addClass("available");
      } else {
        d3.select("#topic-details").style("display","none");
        d3.select("#document-details").style("display","none");
        $("#topic-link").removeClass("available").removeClass("active");
        $("#document-link").removeClass("available").removeClass("active");
      }
      console.log(data);
      createTopicOverTimeVis(topics.getKeys(), data);
      createDeltaRankChart(topics.getKeys());
      updateMapLocations(topics.getKeys());
      loadArticles(topics.getKeys())
      // endLoad();
    },
    error : function(textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

function updateTopicsList(search) {
  startLoad();
  $.ajax({
    type : "GET",
    url : all_topic_list_link,
    data : {
      json_data : JSON.stringify({'keywords' : search})
    },
    success : function(data) {
      console.log("UPDATE TOPICS");
      console.log(data);
      $("#corpus-topics").html("");
      var output = "";
      allTopicList = [];
      allKeys = [];
      $.each(data, function(key, t) {
        allTopicList.push({
          key:t.key,
          desc: arrToString(t.words, 10)
        })
        allKeys.push(t.key);
        var cls = "";
        var clr = "transparent";
        if (topics.contains(t.key)){
          cls = "selected";
          clr = topics.getColor(t.key);
        }
        output = "<li data-topic=" + t.key + "data-rank="
          + t.rank + " class='" + cls + "''>"
            + "<span class='topic-words'>"
              + arrToString(t.words, 5)
            + "</span>" + "&nbsp;"
            + "<span class='color-box' style='background-color:"
              + clr
            + "'></span>"
          + "</li>";
        $("#corpus-topics").append(output);
      });
      endLoad();
    },
    error : function(textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

function addArticleToDocumentDetails(rank, data) {
  var r = rank % 3
  if (r < 1) {
    column = $(".middle.column")
  } else if (r < 2) {
    column = $(".left.column")
  } else {
    column = $(".right.column")
  }
  articleInfo = '<div class="article-info">'
    + '<h3>' + (rank + 1) + '. ' + data.title + '</h3>'
    + '<div class="indent">'
      + '<ol class="general-info no-dec">'
        + '<li>EDITOR: ' + data.editor + '</li>'
        + '<li>DATE: ' + data.date + '</li>'
        + '<li>NEWSPAPER: ' + data.newspaper + '</li>'
        + '<li>LOCATION: ' + data.location + '</li>'
      + '</ol>'
      + '<h4>Top topics for this article:</h4>'
      + '<ol class="topic-info no-dec indent">'
        + (function(tops) {
            var out = "";
            $.each(tops, function(scr, t){
              out += '<li>'
                + 'Topic <span class="key">' + t.key + '</span> &mdash; '
                + 'Scored <span class="score">' + scr + '</span>'
                + '<p class="topic-words indent">'
                    + arrToString(t.words)
                + '</p>'
              + '</li>';
            });
            return out;
          })(data.topics)
        + '</ol>'
      + '</div>'
    + '</div>'
  + '</div>'

  column.append(articleInfo)
}

function loadAdditionalArticles(count=6) {
    loadArticles(topics.getKeys(), nextArticle, count);
}

function loadArticles(keys, start=0, count=6) {
  startMiniLoad();
  $.ajax({
    type : "GET",
    url : articles_link,
    data : {
      json_data : JSON.stringify({
        'topics' : keys,
        'start_at': start,
        'count': count
      })
    },
    success : function(data) {
      if (start != nextArticle) {
        nextArticle = 0;
        $(".column").html("");
      }
      console.log(data);
      $.each(data,function(rank, d) {
        addArticleToDocumentDetails(parseInt(start) + parseInt(rank), d);
      })
      nextArticle += count;
      endMiniLoad();
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
    addTopicToSelected(t);
    updateTopicsSelected(e);
  } else {
    removeTopicFromSelected(this,t);
    updateTopicsSelected(e);
  }
  sortTopicList();
});

$("#clear-selected").on("click", function(e) {
  clearSelected();
  updateTopicsSelected(e);
});
$(".view-ten").click(function(e) {
  console.log("view ten");
  switchMode();
});

$(".view-all").click(function(e) {
  console.log("view all");
  switchMode();
});

$("[name='keyword']").keydown(function(e){
  if ((e.keyCode || e.which) == 13){
    updateTopicsList($("[name='keyword']").val());
  }
});
$("[name='submit-search']").click(function(e){
  updateTopicsList($("[name='keyword']").val());
});

d3.selectAll(".topic-list")
  .style('height', function() {
    return d3.select("#corpus-chart").style('height');
  })


$(".topic-sort").on('click', function(e){
  e.stopPropagation();
  sortOpen = true;
  d3.select(this.parentNode).select('.sort-menu')
    .style("display", 'block');
})

$(window).on('click', function() {
  console.log("NOT POP");
  if (sortOpen) {
    $('.sort-menu').css('display', 'none')
    sortOpen = false;
  }
});

$('.sort-menu').on('click', 'li:not(.heading)', function(e) {
  var sType = parseInt(this.dataset.sort);
  sortMode = sType;
  $('.sort-menu li[data-sort=' + sType + ']').addClass('selected');
  $('.sort-menu li:not([data-sort=' + sType + '])').removeClass('selected');
  sortTopicList();
});

function sortTopicList() {
  switch (sortMode) {
    case 0:
      sortByPrevalence();
      break;
    case 1:
      sortBySimilar();
      break;
    case 2:
      sortSelectedToTop();
      break;
    default:
      return;
  }
}

function sortByPrevalence(){
  var ul = $("#corpus-topics");
  var li = ul.children("li");
  li.detach().sort(function(a, b) {
    return a.dataset.rank - b.dataset.rank;
  });
  ul.append(li);
}
function sortBySimilarity(){

}
function sortSelectedToTop(){
  var ul = $("#corpus-topics");
  var li = ul.children("li.selected");
  li.detach().sort(function(a, b) {
    return a.dataset.rank - b.dataset.rank;
  });
  ul.prepend(li);
}
