from topics.models import WordTopicRank, Topic
from Tome.helpers.debug import Printer
from django.db import IntegrityError, transaction

out = Printer()
progress = Printer(True)


def wipeWordRanks():
    WordTopicRank.objects.all().update(rank=-1)


def generateRanks():
    topics = Topic.objects.all()
    i = 0
    for topic in topics:
        wtrs = topic.wordtopicrank_set.order_by('-score')
        try:
            with transaction.atomic():
                for wtr in wtrs:
                    wtr.rank = i
                    wtr.save()
                    if (i % 1000 == 0):
                        progress.log("{}/".format(i))
                    i += 1
        except IntegrityError:
            wipeWordRanks()


def validateWordRanks():
    return WordTopicRank.objects.filter(rank=-1).count() == 0


def main():
    out.log('Clearing ranks')
    wipeWordRanks()
    out.log('Generating word ranks')
    generateRanks()
    out.log('Validating...')
    success = validateWordRanks()
    if not success:
        raise Exception("Ranks were not generated reliably")
    out.log('Done.')


if __name__ == '__main__':
    main()
