from decimal import Decimal
from django.contrib.staticfiles.templatetags.staticfiles import static
from Tome.settings import BASE_DIR
from news.models import Article
from topics.models import Topic, ArticleTopicRank


def wipeATRs():
    Topic.objects.all().update(score=0)
    ArticleTopicRank.objects.all().delete()


def generateATRs(file_name):
    url = BASE_DIR + static('Tome/data/' + file_name)
    print(url)
    f = open(url)
    counter = 0
    # each article_key
    for line in f:
        items = line.split(",")
        print(counter)
        addATR(counter, items)
        counter += 1


def addATR(article_key, items):
    a = Article.objects.get(key=article_key)
    t_dict = {}
    # each topic-score pair
    for i in range(0, len(items), 2):
        scr = Decimal(items[i+1])
        t_key = items[i]
        if (t_key not in t_dict.keys()):
            t_dict[t_key] = Topic.objects.get(key=t_key)
        t_dict[t_key].score += scr
        t_dict[t_key].save(update_fields=["score"])
        atr = ArticleTopicRank(article=a, topic=t_dict[t_key], score=scr)
        atr.save()


def qRun():
    wipeATRs()
    generateATRs("docTopics.csv")


def main():
    qRun()


if __name__ == '__main__':
    main()
