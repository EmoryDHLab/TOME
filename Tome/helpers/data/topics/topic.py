from topics.models import Word, Topic, WordTopicRank
from Tome.helpers.data.helpers.wordfix import getWordDataFromLine, WORDS_TITLE
from Tome.helpers.data.helpers.general import BASE_PATH
from Tome.helpers.debug import Printer
from decimal import Decimal

progress = Printer(True)
out = Printer()


def wipeTopics():
    Topic.objects.all().delete()
    WordTopicRank.objects.all().delete()


def buildTopic(key):
    return Topic(key=key)


def buildWordTopicPair(word_id, topic_id, score):
    return WordTopicRank(word_id=word_id, topic_id=topic_id, score=score)


def createTopics():
    topics = [buildTopic(i) for i in range(100)]
    return Topic.objects.bulk_create(topics)


def pairWords():
    f = open(BASE_PATH + WORDS_TITLE + '.csv')
    counter = 0
    word_topic_pairs = []
    baseWordId = Word.objects.all().order_by('id')[0].id
    baseTopicId = Topic.objects.all().order_by('id')[0].id
    progress.reset()
    for line in f:
        wordData = getWordDataFromLine(line, counter)
        topics = wordData[1::2]
        scores = wordData[2::2]
        i = 0
        for topic in topics:
            scr = Decimal(scores[i])
            if (Decimal(0) != scr or scr % 1 != 0):
                wtr = buildWordTopicPair(baseWordId + counter,
                                         baseTopicId + int(topic),
                                         scr)

            word_topic_pairs.append(wtr)
            i += 1
        if (counter % 100 == 0):
            WordTopicRank.objects.bulk_create(word_topic_pairs)
            progress.log(counter)
            word_topic_pairs = []
        counter += 1
    if word_topic_pairs:
        WordTopicRank.objects.bulk_create(word_topic_pairs)


def main():
    out.log("clearing topics")
    wipeTopics()
    out.log("creating topics")
    createTopics()
    out.log("pairing topics and words")
    pairWords()


if __name__ == '__main__':
    main()
