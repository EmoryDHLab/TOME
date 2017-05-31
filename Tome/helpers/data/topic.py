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


def addTopic(line):
    items = line.split(',')
    k = items[0]
    items = items[1:]
    print(k)
    t = Topic(key=k)
    t.save()
    word_dict = {}
    for i in range(0, len(items), 2):
        print(items[i])
        if (items[i] in word_dict.keys()):
            temp = items[i]
            items[i] = items[i] + "_" + str(word_dict[items[i]])
            word_dict[items[i]] = word_dict[temp] + 1
        else:
            word_dict[items[i]] = 0
        w, s = Word.objects.get_or_create(text=items[i])
        if (not s):
            w.save()
        wtr = WordTopicRank(word=w, score=items[i+1], topic=t)
        wtr.save()
def qRun():
    wipeTopics()
    importTopics("AntiSlaveryTopics.csv")

def main():
    qRun()

if __name__ == '__main__':
    main()
