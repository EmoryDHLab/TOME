import simplejson as json
from django.shortcuts import render
from news.models import Corpus
from topics.models import Topic
# from django.db.models import Count


# Create your views here.
def index(request):
    data = {}
    # get the corpus for later use
    corpus = Corpus.objects.all().prefetch_related('topics')[0]
    data["corpus"] = corpus
    data["topics"] = Topic.objects.all().order_by('rank')

    ytrs = corpus.yeartopicrank_set.order_by("year", "rank") \
        .select_related('topic')
    topics = {}
    for ytr in ytrs:
        if (ytr.year not in topics):
            topics[ytr.year] = []
        topics[ytr.year].append({
            "topic": ytr.topic.key,
            "year": ytr.year,
            "score": ytr.score,
            "rank": ytr.rank,
            "percentage": ytr.percentage
        })

    data["topics_js"] = json.dumps(topics)
    return render(request, 'Tome/index.html', data)
