from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
import simplejson as json;

from .models import Topic,ArticleTopicRank
from news.models import Location

# Create your views here.
def index(request):
    topics_list = Topic.objects.all()
    topics_len = len(topics_list)
    context = {
        'topics_len': topics_len,
        'topics_list': topics_list
    }
    return render(request,'topics/index.html', context)

def topicsAsJSON(request):
    keys = json.loads(request.GET.get("json_data"))
    if ("topics" not in keys):
        return
    topics = Topic.objects.filter(key__in = keys["topics"])
    topics_json = {}
    for t in topics:
        topics_json[t.key] = t.toJSON(True)
    topics_json = json.dumps(topics_json)
    return HttpResponse(topics_json, content_type='application/json')

def allTopicsAsJSON(request):
    keys = json.loads(request.GET.get("json_data"))
    if ("keywords" in keys):
        keywords = keys["keywords"].strip()
        tokens = keywords.split(" ")
    topics = []
    topics.append(Topic.objects.filter(words__text__in=tokens).distinct().order_by('-wordtopicrank__score'))
    topics.append(Topic.objects.exclude(words__text__in=tokens).distinct())
    topics_json = {}
    rank = 1;
    for qset in topics:
        ids = []
        for t in qset:
            if (t.id not in ids):
                ids.append(t.id)
                topics_json[rank] = t.toJSON(True)
                rank += 1

    topics_json = json.dumps(topics_json)
    return HttpResponse(topics_json, content_type='application/json')

def locationMap(request):
    keys = json.loads(request.GET.get("json_data"))
    topics = Topic.objects.filter(key__in = keys["topics"]).order_by('-rank')
    locs_json = {}
    locs = Location.objects.all();
    for loc in locs:
        l = {}
        l['location'] = loc.toJSON(True)
        l['topics'] = {}
        for t in topics:
            l["topics"][t.key] = t.aggregateScoreByLocation(loc.id)
        locs_json[loc.id] = l
    locs_json = json.dumps(locs_json)
    return HttpResponse(locs_json, content_type='application/json')

def getArticles(request):
    print(request)
    keys = json.loads(request.GET.get("json_data"))
    atrs = ArticleTopicRank.objects.filter(topic__key__in = keys['topics'])
    start = keys["start_at"]
    count = keys["count"]
    atrs = atrs[start:start+count]
    i = 0
    tempD = {}
    for atr in atrs:
        tOb = atr.article.toJSON(True)
        ct = len(keys['topics'])
        tOb["topics"] = atr.article.getTopTopics(3, True, True, keys['topics'])
        tempD[i] = tOb
        i+=1
    return HttpResponse(json.dumps(tempD), content_type='application/json')
