from topics.models import *
from Tome.settings import BASE_DIR
from django.contrib.staticfiles.templatetags.staticfiles import static

def wipeTopics():
    Topic.objects.all().delete()
    Word.objects.all().delete()
    WordTopicRank.objects.all().delete()


def importTopics(file_name):
    url = BASE_DIR + static('Tome/data/' + file_name)
    print(url)
    f = open(url)
    counter = 0;
    for line in f:
        addTopic(line)
        counter+=1
        print(counter)


def addTopic(line):
    items = line.split(',')
    items = items[1:]
    t = Topic()
    t.save()
    for i in range(0, len(items), 2):
        w, s = Word.objects.get_or_create(text=items[i])
        if (not s):
            w.save()
        wtr = WordTopicRank(word=w, score=items[i+1], topic=t)
        wtr.save()
def qRun():
    wipeTopics()
    importTopics("AntiSlaveryTopics.csv")
