/*
  Controls basic interaction on the site, and also has AJAX calls for data
*/
var LOADING = false;
const DNM_ID = "dnm-vis"
var previousSearch = "";

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');

var sortOpen = false;
var sortMode = 0;

var  mn = document.getElementById("head-nav");
    mns = "head-nav-scrolled";
    hdr = document.getElementsByTagName('header')[0].offsetHeight;
var scrollTop = function() {
  return (window.pageYOffset !== undefined) ? window.pageYOffset :
    (document.documentElement || document.body.parentNode ||
    document.body).scrollTop;
}

function getScrollBarWidth () {
    var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
        widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
    $outer.remove();
    return 100 - widthWithScroll;
};

function isOverflowing(search) {
    var container = document.querySelectorAll(search)[0];
    return container.scrollHeight > container.clientHeight;
}

function getArticleCount() {
  return document.querySelectorAll('#documents .articles .article').length;
}

function getLoadedArticleKeys() {
  articleKeys = [];
  for (element of document.querySelectorAll('#documents .articles .article')) {
    articleKeys.push(element.dataset.key);
  }
  return articleKeys;
}

// given an id, change the nav menu to have that selected
function navChange(id, scrollToIt) {
  $("nav .active").removeClass("active");
  $("nav li").filter(function() {
    return this.children[0].getAttribute('href') == "#" + id;
  }).addClass("active");
  if (scrollToIt) {
    document.querySelector("#" + id).scrollIntoView();
  }
  if(history.pushState) {
    history.pushState(null, null, "#" + id);
  }
  else {
      location.hash = "#" + id;
  }
}

function wordObjToString(arr, ct=-1) {
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
  var winBottom = $(window).scrollTop() + $(window).height();
  var currentSection = $(".section").filter(function() {

    var buffer = 20;
    var elTop = $(this).offset().top;
    var elBottom = $(this).offset().top + $(this).outerHeight(true);
    return $(this).css('display') != 'none' && elTop + buffer < winBottom;
  }).slice(-1)[0];
  if (currentSection) {
    navChange(currentSection.id, false);
  }

  if(winBottom >= $(document).height() - 200) {
    if(!topics.empty() && (getArticleCount() != 0) && !LOADING) {
      //startMiniLoad();
      //loadAdditionalArticles();
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

      $.each(data, function(key, val) {
        output += "<span class='topic-title' data-topic='"
          + val.key + "'>"
        if (topics.count == 1) {
          output += "<div class='color-box' style='background-color:"
            + topics.getColor(val.key) + "'>&nbsp;&nbsp;&nbsp;</div>";
          words = wordObjToString(val.words.slice(0,10));
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
        d3.select("#documents").style("display","block");
        d3.select(".d3-tip").style("display","block");
        d3.select("#document-details").style("display","block");
        $("#topic-link").addClass("available");
        $("#document-link").addClass("available");
      } else {
        d3.select("#topic-details").style("display","none");
        d3.select("#documents").style("display","none");
        d3.select(".d3-tip").style("display","none");
        d3.select("#document-details").style("display","none");
        $("#topic-link").removeClass("available").removeClass("active");
        $("#document-link").removeClass("available").removeClass("active");
      }
      console.log(data);
      createTopicOverTimeVis(topics.getKeys(), data);
      updateMapLocations(topics.getKeys());
      makeTopicCompBars(data);
      loadArticles(topics.getKeys());
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
      $("#corpus-topics").html("");
      var output = "";
      allTopicList = [];
      allKeys = [];
      $.each(data, function(key, t) {
        allTopicList.push({
          key:t.key,
          desc: wordObjToString(t.words, 10)
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
              + wordObjToString(t.words, 5)
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

function addArticleToDocumentDetails(data) {
  if (articleSelected(data.key)) {
    return false;
  }
  var ct = document.getElementsByClassName('article-info').length,
      r = ct % 3;
  if (r < 1) {
    column = $(".middle.column")
  } else if (r < 2) {
    column = $(".left.column")
  } else {
    column = $(".right.column")
  }
  articleInfo = '<div class="article-info" data-key=' + data.key + '>'
    + '<h3>' + (ct + 1) + '. ' + data.title + '</h3>'
    + '<div class="indent">'
      + '<ol class="general-info no-dec">'
        + '<li>EDITOR: ' + data.editor + '</li>'
        + '<li>DATE: ' + data.date + '</li>'
        + '<li>NEWSPAPER: ' + data.newspaper + '</li>'
        + '<li>LOCATION: ' + data.location + '</li>'
      + '</ol>'
      + '<h4>Top topics from selected:</h4>'
      + '<ol class="topic-info no-dec indent">'
        + (function(tops) {
            var out = "";
            $.each(tops, function(i, t){
              out += '<li>'
                + 'Topic <span class="color-box key" '
                  +'style="background-color:' + topics.getColor(t.key)
                  + '">' + t.key + '</span> &mdash; '
                + 'Scored <span class="score">' + t.score + '</span>'
                + '<p class="topic-words indent">'
                    + (function(words) {
                        var out = "";
                        for (var i = 0; i < words.length; i++) {
                          out += words[i]
                          if (i + 1 < words.length) {
                            out += ", "
                          }
                        }
                        return out;
                      })(t.words)
                + '</p>'
              + '</li>';
            });
            return out;
          })(data.topics)
        + '</ol>'
      + '</div>'
    + '</div>'
  + '</div>'
  $('.column-wrap').append(articleInfo);
  return true;
}

function removeArticleDetails(key) {
  $('.article-info[data-key="' + key + '"]').remove();
}

function addArticleToDocuments(article) {
  console.log(article)
  var articleDiv = document.createElement("div");
    articleDiv.className = "article";
    articleDiv.dataset.key = article.key;
  var count = document.createElement("p");
    count.innerHTML =  article.rank + 1;
    count.className = "count";
    $(articleDiv).append(count);
  var title = document.createElement("p");
    title.innerHTML = (article.title != '') ? article.title : "Article " + article.key;
    title.className = "title";
    $(articleDiv).append(title);
  var date = document.createElement("p");
    date.innerHTML = article.date;
    date.className = "date";
    $(articleDiv).append(date);
  var newspaper = document.createElement("p");
    newspaper.innerHTML = article.newspaper;
    newspaper.className = "paper-title";
    $(articleDiv).append(newspaper);
  var prevalence = document.createElement("p");
    prevalence.innerHTML = truncateDecimals(article.score, 4);
    $(articleDiv).append(prevalence);
  var topTops = getStyledTopics(article.topics);
    $(articleDiv).append(topTops);
  $("#documents .articles").append(articleDiv);
  if (isOverflowing("#documents .articles")) {
    var shift = getScrollBarWidth();
    $("#documents .articles").css("margin-right","-" + shift+"px");
  } else {
    $("#documents .articles").css("padding-right", "0px");
  }
}

function getStyledTopics(articleTopics, count=3) {
  var topTops = document.createElement("p"),
      i = 0;
  while (count > 0 && i < articleTopics.length){
    var t = document.createElement("div"),
        k = articleTopics[i].key;
        color = topics.getColor(k);
    t.style.backgroundColor = color;
    t.className = "color-box";
    t.innerHTML = k;
    topTops.appendChild(t);
    count--;
    i++;
  }
  topTops.className = "top-topics"
  return topTops;
}

function loadAdditionalArticles(count=50) {
  loadArticles(topics.getKeys(), getLoadedArticleKeys(), count, false);
}

function clearArticlesTable() {
  $(".column").html("");
  $("#documents .articles").html("");
}

function addArticlesToDustAndMagnet(articles, wipeDust) {
  // can't clear the old one, we have to add to it! hmm....
  // probably just add to an fData object as we go.
  renderFromArticleData(DNM_ID, articles,
    topics.getSelected().filter(function(k) {
      return k != undefined;
    }).map(function(k) {
      return { name: k, fill: topics.getColor(k) };
    }), wipeDust);
}

function loadArticles(keys, excludeArticles=[], count=50, overwrite=true) {
  console.log(keys);
  console.log(excludeArticles);
  console.log(count);
  startMiniLoad();
  $.ajax({
    type : "POST",
    url : articles_link,
    beforeSend: function(xhr){xhr.setRequestHeader('X-CSRFToken', csrftoken);},
    data : {
      json_data : JSON.stringify({
        'topics' : keys,
        'articles': excludeArticles,
        'count': count
      })
    },
    success : function(data) {
      if (overwrite) {
        clearArticlesTable()
      }
      console.log(data);
      articles = data.articles;
      $.each(articles, function(rank, article) {
        addArticleToDocuments(article)
      })
      addArticlesToDustAndMagnet(articles, overwrite);
      var h = $(".left.column .article-info").first().outerHeight(true);
      $(".article-info").css("min-height", h);
      $(".loaded-articles").html(data.show_count);
      $(".total-articles").html(data.total_count);
      endMiniLoad();
    },
    error : function(textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

function articleSelected(key) {
  var existCheck = ".article-info[data-key='" + key + "']";
  if (document.querySelectorAll(existCheck).length > 0) {
    return true;
  }
  return false;
}

function getArticleDetails(articleKey, useSelectedTopics=true, count=5) {
  $.ajax({
    type: "GET",
    url: "/news/article/" + articleKey,
    data: {
      json_data : JSON.stringify({
        'topics' : (useSelectedTopics) ? topics.getKeys() : [],
        'topic_count': count
      })
    },
    success: function(data) {
      addArticleToDocumentDetails(data)
    },
    error: function(textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

$("#more-articles").click(function() {
  loadAdditionalArticles();
});

$("nav").on("click", "li:not(.available) a", function(e){ e.preventDefault() });
$("nav").on("click", "li.available:not(.active) a", function(e){
  e.preventDefault();
  navChange(this.getAttribute("href").substring(1), true)
  $("li.active").removeClass("active");
  $(this.parentNode).addClass("active");
});

$(".topic-list").on("mouseover", "li:not(.selected)", function(){
  if (tenMode) {
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
    removeTopicFromSelected(t);
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
    var keywords = $("[name='keyword']").val()
    if (keywords != previousSearch){
      updateTopicsList(keywords);
      previousSearch = keywords;
    }
  }
});
$("[name='submit-search']").click(function(e){
  var keywords = $("[name='keyword']").val()
  if (keywords != previousSearch){
    updateTopicsList(keywords);
    previousSearch = keywords;
  }
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
    d3.select('.sort-menu')
      .style("display", 'none');
  }
});

$('.sort-menu').on('click', 'li:not(.heading)', function(e) {
  e.stopPropagation();
  var sType = parseInt(this.dataset.sort);
  sortMode = sType;
  $('.sort-menu li[data-sort=' + sType + ']').addClass('selected');
  $('.sort-menu li:not([data-sort=' + sType + '])').removeClass('selected');
  sortTopicList();
});

$("body").on("dblclick", '.article', function(e) {
  var target = e.currentTarget,
      key = target.dataset.key;
  if (articleSelected(key)){
    deselectArticle(key);
  } else {
    selectArticle(key);
  }
});

$("body").on("click", '#dnm-zoom-reset', function(e) {
  resetDNMZoom(DNM_ID);
});

$("body").on("click", '#dnm-zoom-in', function(e) {
  zoomIn(DNM_ID);
});

$("body").on("click", '#dnm-zoom-out', function(e) {
  zoomOut(DNM_ID);
});

function switchView(switchViewId, viewItemName) {
  var itemNameQuery = "#" + switchViewId + " .vs-item[data-item-name='" + viewItemName + "']";
  console.log($("vs-item.active"));
  $("#" + switchViewId + " .vs-item.active").removeClass('active');
  $(itemNameQuery).addClass('active');
}

$("body").on("click", ".view-switch button", function(e) {
  console.log(e.currentTarget.dataset);
  switchView(e.currentTarget.dataset.target, e.currentTarget.name);
});

function resetDNMZoom(id) {
  resetZoomPan(id);
}

function selectArticle(key) {
  getArticleDetails(key); // select the article
  $('.article[data-key="' + key + '"]').addClass('selected');
}
function deselectArticle(key) {
  removeArticleDetails(key);
  $('.article[data-key="' + key + '"]').removeClass('selected');
}
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
  return;
}
function sortSelectedToTop(){
  var ul = $("#corpus-topics");
  var li = ul.children("li.selected");
  li.detach().sort(function(a, b) {
    return a.dataset.rank - b.dataset.rank;
  });
  ul.prepend(li);
}
