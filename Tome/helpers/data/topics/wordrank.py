from topics.models import WordTopicRank, Topic
from Tome.helpers.debug import Printer

out = Printer()


def wipeWordRanks():
    WordTopicRank.objects.all().update(rank=0)


def generateRanks():
    topics = Topic.objects.all()
    for topic in topics:
        wtrs = topic.wordtopicrank_set.order_by('-score')
        i = 0
        for wtr in wtrs:
            wtr.rank = i
            wtr.save()
            if (i % 100 == 0):
                out.log("{}".format(i))
            i += 1


def qRun():
    out.log('Clearing ranks')
    wipeWordRanks()
    out.log('Generating word ranks')
    generateRanks()


def main():
    qRun()


if __name__ == '__main__':
    main()
