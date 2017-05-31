from news.models import *
from topics.models import *
from Tome.helpers.time_helpers import *
from django.core.exceptions import ObjectDoesNotExist
from Tome.settings import BASE_DIR
from django.contrib.staticfiles.templatetags.staticfiles import static

def wipeATRs():
    ArticleTopicRank.objects.all().delete()

def generateATRs(file_name):
    url = BASE_DIR + static('Tome/data/' + file_name)
    print(url)
    f = open(url)
    counter = 0;
    for line in f:
        items = line.split(",")
        addATR(counter,items)
        counter+=1

def addATR(article_key,items):
    a = Article.objects.get(key=article_key)
    topic_dict = {}
    for i in range(0, len(items), 2):
        if (items[i] not in topic_dict.keys()):
            t = Topic.objects.get(key=items[i])
            topic_dict[items[i]] = t
        else:
            t = topic_dict[items[i]]
        atr = ArticleTopicRank(article=a, topic=t, score=items[i+1])
        atr.save()
def qRun():
    wipeATRs()
    generateATRs("docTopics.csv")

def main():
    qRun()

if __name__ == '__main__':
    main()
