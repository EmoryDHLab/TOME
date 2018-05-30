from django.db.models import Count, Sum
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import simplejson as json
from .models import Topic, ArticleTopicRank, NewspaperTopicPair
from news.models import Newspaper, Article


def index(request):
    topics_list = Topic.objects.all()
    topics_len = len(topics_list)
    context = {
        'topics_len': topics_len,
        'topics_list': topics_list
    }
    return render(request, 'topics/index.html', context)


def topicsAsJSON(request):
    keys = json.loads(request.GET.get("json_data"))
    if ("topics" not in keys):
        return
    topics = Topic.objects.filter(key__in=keys["topics"])
    topics_json = {}
    for t in topics:
        topics_json[t.key] = t.toJSON()
    topics_json = json.dumps(topics_json)
    return HttpResponse(topics_json, content_type='application/json')


# Returns an ordered list of topic keys to the client so that we can reorder on
# the client
def allTopicsAsJSON(request):
    keys = json.loads(request.GET.get("json_data"))
    word = keys["word"].strip()
    topics = list(Topic.objects.prefetch_related('words')
                  .select_related('wordtopicrank')
                  .filter(words__text=word)
                  .distinct().order_by('-wordtopicrank__score')
                  .values_list('key', flat=True))
    topics_json = json.dumps(topics)
    return HttpResponse(topics_json, content_type='application/json')


def locationMap(request):
    """
    Returns JSON describing each location and its component topics
        {
            'location_id': {
                'location' : {  Location JSON  },
                'topics' : { # by rank
                    0 :
                }
            },

        }
    """
    keys = json.loads(request.GET.get("json_data"))
    # get the scores by paper, annotate with paper article count
    ntps = NewspaperTopicPair.objects.select_related('newspaper__location')\
        .select_related('topic').filter(topic__key__in=keys["topics"])\
        .annotate(article__count=Count('newspaper__issue__article'))\
        .order_by('newspaper', 'topic__score')
    locs_json = {}
    # locs = Location.objects.annotate(newspaper_count=Count('newspaper'))\
    #     .filter(newspaper_count__gt=0)
    topic_counter = 0
    paper_counter = 0
    for ntp in ntps:
        paper = ntp.newspaper
        loc = paper.location
        topic = ntp.topic
        lc = {} if (loc.id not in locs_json) else locs_json[loc.id]
        if not lc:
            lc['location'] = loc.toJSON()
            lc['topics'] = {}
            lc['papers'] = {}
        if (paper.id not in lc["papers"]):
            paper_counter += 1
            topic_counter = 0
            lc["papers"][paper.id] = {
                "title": paper.title,
                "topics": {}
            }
        lc["papers"][paper.id]["topics"][topic_counter] = {
            'key': topic.key,
            'score': 100 * (ntp.score / ntp.article__count)
        }
        lc['topics'][topic_counter] = {
            'key': topic.key,
            'score': topic.percentByLocation(loc.id)
        }
        topic_counter += 1
        locs_json[loc.id] = lc
    locs_json = json.dumps(locs_json)
    return HttpResponse(locs_json, content_type='application/json')


def constructArticleTableData(keys, count, received_articles):
    json_response = {}
    print('getting article data:', keys, count, received_articles)
    total_received_articles = len(received_articles)
    # determine which the articles we want
    # .order_by('topic', '-score')\
    id_score_tups = ArticleTopicRank.objects \
        .select_related('article') \
        .select_related('topic') \
        .filter(topic__key__in=keys)\
        .exclude(article__key__in=received_articles)\
        .values('article')\
        .annotate(score=Sum('score')).order_by("-score")\
        .values_list('article__key',
                     'article__title',
                     'score',
                     'article__issue__date_published',
                     'article__issue__newspaper__title')[:count]
    relevant = list(id_score_tups)
    # Get all atrs which have not yet been sent, within the given topics
    # Then preselect the articles to we can access them easily later
    atr_tups = ArticleTopicRank.objects \
        .select_related('article') \
        .select_related('topic') \
        .filter(
            topic__key__in=keys,
            article__key__in=[k for (k, t, s, d, n) in relevant])\
        .order_by('-score')\
        .values_list("article__key", "topic__key", "score")
    # collect and format the article topic ranks for use later
    atrs = {}
    for atr in atr_tups:
        article_key, topic_key, score = atr
        atr_object = {
            "key": topic_key,
            "score": score
        }
        if article_key not in atrs:
            atrs[article_key] = []
        atrs[article_key].append(atr_object)
    # construct article list
    articles = []
    ct = total_received_articles
    for article in relevant:
        key, title, score, date, newspaper = article
        art_dict = {
            "title": title,
            "key": key,
            "score": score,
            "date": str(date),
            "newspaper": newspaper,
            "rank": ct,
            "topics": atrs[key]
        }
        articles.append(art_dict)
        ct += 1
    json_response["articles"] = articles
    json_response["show_count"] = total_received_articles + len(articles)
    json_response["total_count"] = Article.objects.count()
    return json_response


@csrf_exempt
def getArticleTableData(request):
    '''
    This function responds with json as seen below. Articles given have limited
    information
    {
        "articles" : [                // articles ordered by collective scr
            {                           // the best correlated article
                "title": "article.title",       // the article title
                "key": 1,                       // the article key
                "score": 0.512,                 // sum score of givn topics
                "rank": 0                       // ranked # 1
                "date": ""                      // date object
                "topics": [                     // the individual topics
                    { "key": 0, "score": 0.500 }, // highest rnked topic
                    .                                // score from atr
                    .
                    .
                ]
            },
        },
        "show_count" : len(received_articles) + count,
        "total_count" : Article.objects.count()
    }'''
    # the topic keys we want to include
    dat = json.loads(request.body)
    keys = dat['topics']
    print(keys)
    # the number of articles to get
    count = int(dat["count"])
    print(count)
    # the keys of all articles already in the client
    received_articles = dat['articles']
    print(received_articles)
    # set up dictionary for response
    if count is None or count < 1:
        return HttpResponse({"error": "invalid article request"},
                            content_type='application/json')
    json_response = constructArticleTableData(keys, count, received_articles)

    return HttpResponse(json.dumps(json_response),
                        content_type='application/json')


def topicsByPaper(request):
    """
        Gets all topics as a percentage of each newspaper
    """
    keys = json.loads(request.GET.get("json_data"))
    topic_keys = keys['topics']
    papers = Newspaper.objects.all()
    topics = Topic.objects.filter(key__in=topic_keys)
    tempD = {}  # 1
    ct = 0
    # for each paper
    for paper in papers:
        tempD2 = {'paper': {'key': paper.key, 'title': paper.title}}
        tempD2['topics'] = {}  # 4
        rank_counter = 0
        for topic in topics:
            tempD2['topics'][rank_counter] = {
                'key': topic.key,
                'percent': topic.percentByPaper(paper.key)
            }
            rank_counter += 1
        tempD[ct] = tempD2
        ct += 1
    return HttpResponse(json.dumps(tempD), content_type='application/json')
