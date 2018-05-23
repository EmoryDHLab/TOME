from topics.models import ArticleTopicRank, Topic
from Tome.helpers.debug import Printer
from django.db import IntegrityError, transaction

out = Printer()
progress = Printer(True)


def wipeATRRanks():
    ArticleTopicRank.objects.all().update(rank=-1)


def generateRanks():
    topics = Topic.objects.all()
    ct = 0
    for topic in topics:
        atrs = topic.articletopicrank_set.order_by('-score')
        i = 0
        try:
            with transaction.atomic():
                for atr in atrs:
                    atr.rank = i
                    atr.save()
                    i += 1
                    progress.log('{}'.format(i))
        except IntegrityError:
            wipeATRRanks()
            progress.log("ERROR")
        ct += 1
        progress.log("{}/100".format(ct))
    out.log()


def validateATRRanks():
    return ArticleTopicRank.objects.filter(rank=-1).count() == 0


def qRun():
    out.log('Clearing atr ranks')
    wipeATRRanks()
    out.log('Generating atr ranks')
    generateRanks()
    out.log('Validating')
    validateATRRanks()
    out.log('Done')


def main():
    qRun()


if __name__ == '__main__':
    main()
