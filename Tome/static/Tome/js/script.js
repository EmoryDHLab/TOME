/*
  Controls basic interaction on the site, and also has AJAX calls for data
*/
var LOADING = false;
const DNM_ID = "dnm-vis"
var previousSearch = "";
var topicSelectionTimeout = null;
const TOPIC_SELECTION_PAUSE_TIME = 800;
const MAX_WORDS = 30;
const ADDITIONAL_WORD_LIST = {}
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

// $('document').on('resize', function(e))


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
function navChange(dest, scrollToIt) {
  var id = (dest[0] === '#' || dest[0] === '@') ? dest.substring(1) : dest
  $("nav .active").removeClass("active");
  $("nav li").filter(function() {
    return this.children[0].getAttribute('href') == "#" + id;
  }).addClass("active");
  if(history.pushState) {
    history.pushState(null, null, "#" + id);
  }
  else {
    location.hash = "#" + id;
  }
  if (dest[0] === '@') {
    openOverlay(id)
  } else {
    if (scrollToIt) {
      document.querySelector("#" + id).scrollIntoView();
    }
  }
}

function openOverlay(id) {
  $('#' + id).addClass('is-open')
}

function closeOverlay(id) {
  $('#' + id).removeClass('is-open')
}

function wordObjToString(arr, ct=-1) {
  var s = arr.slice(0, (ct != -1 && ct < arr.length) ? ct : arr.length)
    .map(function(x) { return x.word })
  return wordListToString(s);
}

function wordListToString(arr, ct=-1) {
  var s = arr.slice(0, (ct != -1 && ct < arr.length) ? ct : arr.length)
    .reduce(function(str, word) {
      return str + ((str === "") ? "" : ", ") + word
    },"")
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
appendSlider("#horizontal-slide", false, [data_start_year - 1, data_end_year - 1]);

function startLoad() {
  $("#loader").css("display","block");
}
function endLoad() {
  $("#loader").css("display","none");
}

function startMiniLoad() {
  LOADING = true;
  console.log("load");
  $("#loader").css("display","block");
}
function endMiniLoad() {
  LOADING = false;
  console.log("stopMiniLoad");
  $("#loader").css("display","none");
}

function getTopicWords(topicKey) {
  if (ADDITIONAL_WORD_LIST[topicKey]) {
    return Promise.resolve(ADDITIONAL_WORD_LIST[topicKey])
  }
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: "GET",
      url: '/topics/' + topicKey + '/words',
      data: {
        count: MAX_WORDS,
        offset: 0,
      },
      success: function (words) {
        console.log('hit');
        ADDITIONAL_WORD_LIST[topicKey] = words
        return resolve(words)
      },
      error: function (xhr, ajaxOptions, err) {
        return reject(err)
      }
    });
  })
}

function updateTopicsSelected(e) {
  startLoad();
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
      var first = true
      $.each(data, function(key, val) {
        output += "<span class='topic-title " + ((first) ? "active" : "")
          + "' data-topic='"
          + val.key + "'>"
        if (first) {
          first = false
          getTopicWords(val.key)
            .then(function (words) {
              $('#topic-words').html(wordListToString(words, MAX_WORDS));
            })
        }
        console.log("WRD:", words);
        output += "<span>TOPIC " + val.key + "</span>";
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
        $("#document-details-link").addClass("available");
      } else {
        d3.select("#topic-details").style("display","none");
        d3.select("#documents").style("display","none");
        d3.select(".d3-tip").style("display","none");
        d3.select("#document-details").style("display","none");
        $("#topic-link").removeClass("available").removeClass("active");
        $("#document-link").removeClass("available").removeClass("active");
        $("#document-details-link").removeClass("available")
          .removeClass("active");

      }
      console.log(data);
      Promise.all([
        createTopicOverTimeVis(topics.getKeys(), data),
        updateMapLocations(topics.getKeys()),
        makeTopicCompBars(data),
        loadArticles(topics.getKeys())
      ]).then(function() {
        endLoad();
      });
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
      json_data : JSON.stringify({'word' : search})
    },
    success : function(data) {
      console.log("UPDATE TOPICS");
      $(".search-result").removeClass('search-result')
      $(".searched").removeClass('searched')
      listElementsSorted = $("#corpus-topics li").detach().sort(function(a, b) {
        console.log(a.dataset.rank, b.dataset.rank)
        return a.dataset.rank - b.dataset.rank;
      });
      if (data.length > 0) {
        $("#corpus-topics").addClass('searched')
      }
      $("#corpus-topics").append(listElementsSorted);
      data.reverse()
        .forEach(function(tKey) {
          var curr = $("#corpus-topics [data-topic='" + tKey + "']").detach()
          curr.addClass('search-result');
          $("#corpus-topics").prepend(curr);
      });
      endLoad();
    },
    error : function(textStatus, errorThrown) {
      console.log(textStatus);
    }
  });
}

function topicToListElement(t) {
  var inTopics = topics.contains(t.key);
  var cls = (inTopics) ? "selected" : "";
  var clr = (inTopics) ? topics.getColor(t.key) : "transparent";
  output = "<li data-topic=" + t.key + "data-rank="
    + t.rank + " class='" + cls + "''>"
      + "<span class='topic-words'>"
        + wordObjToString(t.words, 5)
      + "</span>" + "&nbsp;"
      + "<span class='color-box' style='background-color:"
        + clr
      + "'></span>"
    + "</li>";
    return output;
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

  var months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  var datestuff = data.date.split('/')
  console.log(datestuff)
  var month = months[parseInt(datestuff[0]) - 1],
      day = datestuff[1],
      year = datestuff[2];
  articleInfo = '<div class="article-info removable" data-key=' + data.key + '>'
    + '<div class=article-head>'
      + '<h3>' + (ct + 1) + '. ' + data.title + '</h3>'
      + '<button class="delete btn-lite">'
        + '<i class="fas fa-trash-alt" aria-hidden="true"></i>'
      + '</button>'
    + '</div>'
    + '<div class="indent">'
      + '<p>'
        + data.newspaper + ', ' + month + ' ' + day + ', ' + year
      + '</p>'
      + '<p><a target="blank" href="#document-details">view complete text</a></p>'
      + '<h5>Top selected topics:</h5>'
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

function loadAdditionalArticles(count=1) {
  loadArticles(topics.getKeys(), getLoadedArticleKeys(), count, false);
}

function clearArticlesTable() {
  $(".column").html("");
  $("#documents .articles .article").remove();
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

function loadArticles(keys, excludeArticles=[], count=1, overwrite=true) {
  console.log(keys);
  console.log(excludeArticles);
  console.log(count);
  $('.articles').addClass('loading');
  const getArticles = new Promise(function (resolve, reject) {
    $.ajax({
      type : "POST",
      url : articles_link,
      beforeSend: function(xhr){xhr.setRequestHeader('X-CSRFToken', csrftoken);},
      data : JSON.stringify({
        topics : keys,
        articles: excludeArticles,
        count: count
      }),
      success : function(data) {
        resolve(data);
      },
      error : function(textStatus, errorThrown) {
        console.log(textStatus);
        reject(errorThrown);
      }
    });
  });
  return (getArticles
    .then(function(data) {
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
      return;
    })
    .then(function() {
      $('.articles').removeClass('loading');
    }));
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

function clearSelectedArticles() {
  $('.article.selected').removeClass('selected');
  $('.article-info').remove()
}


$("#more-articles").click(function() {
  loadAdditionalArticles();
});

$("nav").on("click", "li:not(.available) a", function(e){ e.preventDefault() });
$("nav").on("click", "li.available a", function(e){
  e.preventDefault();
  navChange(this.getAttribute("href"), true)
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
  clearTimeout(topicSelectionTimeout);
  var t = this.dataset.topic;
  var add = ! d3.select(this).classed("selected");
  if (add) {
    addTopicToSelected(t);
  } else {
    removeTopicFromSelected(t);
  }
  topicSelectionTimeout = setTimeout(function() {
    updateTopicsSelected(e);
  }, TOPIC_SELECTION_PAUSE_TIME)
  //sortTopicList();
});

function topicSelectionHandler(element, event) {

}


$("#clear-selected").on("click", function(e) {
  clearSelected();
  updateTopicsSelected(e);
});
$(".view-ten").click(function(e) {
  console.log("view ten");
  $(".view-ten").addClass("active");
  $(".view-all").removeClass("active");
  switchMode();
});

$(".view-all").click(function(e) {
  console.log("view all");
  $(".view-ten").removeClass("active");
  $(".view-all").addClass("active");
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

$('body').on('click', '.topic-title', function(e) {
  $('.topic-title').removeClass('active')
  $(e.currentTarget).addClass('active')
  getTopicWords(e.currentTarget.dataset.topic)
    .then(function (words) {
      $('#topic-words').html(wordListToString(words, MAX_WORDS));
    })
})

$("body").on("click", '.article', function(e) {
  var target = e.currentTarget,
      key = target.dataset.key;
  if (articleSelected(key)){
    deselectArticle(key);
  } else {
    selectArticle(key);
  }
});

$('body').on('click', '.overlay', function(e) {
  if (e.target.className.includes('is-open')) {
    closeOverlay(e.currentTarget.id)
  }
})

$('body').on('click', '.close', function(e) {
  console.log($(e.currentTarget).parents('.is-open'))
  closeOverlay($(e.currentTarget).parents('.is-open').attr('id'))
})

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
  $(e.currentTarget).parent().children('.active').removeClass('active');
  $(e.currentTarget).addClass('active');
});

$("body").on('click', '#clear-articles', function(e) {
  clearSelectedArticles()
});

$("#document-details").on('click','button.delete', function(e) {
  deselectArticle($(e.currentTarget).parents(".removable").data('key'))
})

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
