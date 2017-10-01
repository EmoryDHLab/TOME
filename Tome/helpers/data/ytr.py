from topics.models import Topic, YearTopicRank
from news.models import Corpus, Issue


def wipeYTRs():
    YearTopicRank.objects.all().delete()


def generateYTRs():
    dates = Issue.objects.dates("date_published", "year")
    corpus = Corpus.objects.all()[0]
    topics = Topic.objects.all()

    ct = 0
    for t in topics:
        print(ct, "/ 100")
        for date in dates:
            addYTR(date.year, t, corpus)
        ct += 1


def addYTR(y, t, c):
    ytr = YearTopicRank(year=y, topic=t, corpus=c)
    ytr.calculateScore()
    ytr.save()


def main():
    qRun()


def qRun():
    wipeYTRs()
    generateYTRs()


if __name__ == '__main__':
    main()
