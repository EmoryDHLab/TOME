from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
import simplejson as json;

from .models import Topic

# Create your views here.
def index(request):
    newspaper_list = Topic.objects.all()
    topics_len = len(topic_list)
    context = {
        'topics_len': news_len,
        'topics_list': newspaper_list
    }
    return render(request,'topics/index.html', context)

def topicsAsJSON(request):
    keys = json.loads(request.GET.get("json_data"))
    topics = Topic.objects.filter(key__in = keys["topics"])
    topics_json = {}
    for t in topics:
        topics_json[t.key] = t.toJSON(True)
    topics_json = json.dumps(topics_json)
    return HttpResponse(topics_json, content_type='application/json')

def allTopicsAsJSON(request):
    keys = json.loads(request.GET.get("json_data"))
    if ("keywords" in keys):
        keywords = keys["keywords"]
        print(keywords)
    topics = Topic.objects.all()
    topics_json = {}
    rank = 1;
    for t in topics:
        topics_json[rank] = t.toJSON(True)
        rank += 1
    topics_json = json.dumps(topics_json)
    return HttpResponse(topics_json, content_type='application/json')
