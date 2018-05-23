from topics.models import ArticleTopicRank, Topic
from Tome.helpers.debug import Printer

out = Printer(True)


def wipeATRRanks():
    ArticleTopicRank.objects.all().update(rank=-1)


def generateRanks():
    topics = Topic.objects.all()
    for topic in topics:
        atrs = topic.articletopicrank_set.order_by('-score')
        i = 0
        for atr in atrs:
            atr.rank = i
            atr.save()
            if (i % 100 == 0):
                out.log("{}".format(i))
            i += 1


def qRun():
    out.log('Clearing atr ranks')
    wipeATRRanks()
    out.log('Generating atr ranks')
    generateRanks()


def main():
    qRun()


if __name__ == '__main__':
    main()
