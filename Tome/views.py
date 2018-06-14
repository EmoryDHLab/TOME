import simplejson as json
from django.shortcuts import render
from news.models import Corpus
from topics.models import Topic, WordTopicRank
from django.db.models import OuterRef, Subquery
from Tome.helpers.aggregates import GroupConcat
# from django.db.models import Count


# Create your views here.
def index(request):
    data = {}
    # get the corpus for later use
    corpus = Corpus.objects.all()[0]
    data["corpus"] = corpus
    # words = Topic.objects.filter(topic=OuterRef('id'))\
    words = WordTopicRank.objects.filter(topic=OuterRef('id'))\
        .order_by()\
        .values('topic')\
        .annotate(wordlist=GroupConcat('word__text', False, 'rank', ', '))\
        .values('wordlist')
    data["topics"] = Topic.objects.all()\
        .order_by('rank')\
        .annotate(top_words=Subquery(words))

    ytrs = corpus.yeartopicrank_set.order_by("year", "rank") \
        .select_related('topic')
    # topics = {}
    # for ytr in ytrs:
    #     if (ytr.year not in topics):
    #         topics[ytr.year] = []
    #     topics[ytr.year].append({
    #         "topic": ytr.topic.key,
    #         "year": ytr.year,
    #         "score": ytr.score,
    #         "rank": ytr.rank,
    #         "percentage": ytr.percentage
    #     })

    data["ytrs"] = ytrs
    # data["topics_js"] = json.dumps(topics)
    return render(request, 'Tome/index.html', data)
