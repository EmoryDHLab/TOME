from topics.models import Topic, NewspaperTopicPair
from news.models import Newspaper
from Tome.helpers.debug import Printer
from django.db.models import Sum
progress = Printer(True)


def wipeNTPs():
    NewspaperTopicPair.objects.all().delete()


def generateNTPs():
    topics = Topic.objects.all()
    papers = Newspaper.objects.all()
    progress.reset()

    ct = 0
    for t in topics:
        progress.log("{} / 100".format(ct))
        ntps = []
        for p in papers:
            score = t.articletopicrank_set.objects\
                .filter(article__issue__newspaper__id=p.id)\
                .aggregate(paper_score=Sum('score'))['paper_score']
            ntp = buildNTP(p, t, score)
            ntps.append(ntp)
        NewspaperTopicPair.objects.bulk_create(ntps)


def buildNTP(newspaper, topic, score):
    return NewspaperTopicPair(newspaper=newspaper, topic=topic, score=score)


def main():
    qRun()


def qRun():
    wipeNTPs()
    generateNTPs()


if __name__ == '__main__':
    main()
