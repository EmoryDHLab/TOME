from django.shortcuts import render, get_object_or_404
from .models import Newspaper


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
