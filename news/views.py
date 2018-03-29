from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
import simplejson as json
from .models import Newspaper, Article
from topics.models import ArticleTopicRank, Topic


# Create your views here.
def index(request):
    newspaper_list = Newspaper.objects.all()
    news_len = len(newspaper_list)
    context = {
        'news_len': news_len,
        'newspaper_list': newspaper_list
    }
    return render(request, 'news/index.html', context)


def detail(request, newspaper_id):
    newspaper = get_object_or_404(Newspaper, pk=newspaper_id)
    return render(request, 'news/detail.html', {'newspaper': newspaper})


def article_detail(request, article_key):
    # leftover count will backfill with topics not in the desired topics list
    raw_data = request.GET.get("json_data", '{"topic_count":0, "topics":[]}')
    data = json.loads(raw_data)
    topic_ct = int(data['topic_count'])  # how many topics 2 get
    desired_topics = data["topics"]  # required topics 2 include
    article = get_object_or_404(Article, key=article_key)
    article_dict = article.toJSON()
    article_dict["topics"] = []
    if (topic_ct > 0):
        topics = ArticleTopicRank.objects \
            .filter(topic__key__in=desired_topics, article__key=article_key) \
            .values_list("topic__key", "score") \
            .order_by("-score")[:topic_ct]
        ct = topic_ct
        for (key, score) in topics:
            article_dict["topics"].append({
                "key": key,
                "score": score,
                "words": Topic.objects.get(key=key).getWordList(10),
                "article_key": int(article_key)
            })
            ct -= 1
        if ct > 0:
            additional_topics = ArticleTopicRank.objects \
                .filter(article__key=article_key) \
                .exclude(topic__key__in=desired_topics) \
                .values_list("topic__key", "score") \
                .order_by("-score")[:ct]
            for (key, score) in additional_topics:
                article_dict["topics"].append({
                    "key": key,
                    "score": score,
                    "words": Topic.objects.get(key=key).getWordList(10),
                    "article_key": int(article_key)
                })
    article_json = json.dumps(article_dict)
    return HttpResponse(article_json, content_type='application/json')
