from django.shortcuts import render, get_object_or_404

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

def detail(request, topic_id):
    topic = get_object_or_404(Topic, pk=topic_id)
    return render(request, 'topics/detail.html', {'topic':topic})
