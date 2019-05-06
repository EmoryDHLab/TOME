from decimal import Decimal
from news.models import Article
from topics.models import Topic, ArticleTopicRank
from Tome.helpers.data.helpers.general import BASE_PATH
from Tome.helpers.debug import Printer
from django.db.models import Sum

ATRS_TITLE = 'docTopics-new'
TOPIC_COUNT = Topic.objects.count()

out = Printer()
progress = Printer(True)


def getATRDataFromLine(line, lineNumber):
    items = line.strip().split(',')
    topics = items[0::2]
    scores = items[1::2]
    return [(int(topics[i]), Decimal(scores[i])) for i in range(len(topics))]


def wipeATRs():
    Topic.objects.all().update(score=0)
    ArticleTopicRank.objects.all().delete()


def buildATR(article_id, topic_id, score):
    return ArticleTopicRank(article_id=article_id,
                            topic_id=topic_id,
                            score=score)


def createATRs():
    f = open(BASE_PATH + ATRS_TITLE + '.csv')
    counter = 0
    atrs = []
    baseArticleId = Article.objects.all().order_by('id')[0].id
    baseTopicId = Topic.objects.all().order_by('id')[0].id
    # topic_key: cumulative_score
    topic_scores = {k: Decimal(0) for k in range(TOPIC_COUNT)}
    progress.reset()
    for line in f:
        atrs_from_line = getATRDataFromLine(line, counter)
        i = 0
        for atr_data in atrs_from_line:
            scr = Decimal(atr_data[1])
            atr = buildATR(baseArticleId + counter,
                           baseTopicId + atr_data[0],
                           scr)
            topic_scores[atr_data[0]] += scr
            atrs.append(atr)
            i += 1
        if (counter % 100 == 0):
            ArticleTopicRank.objects.bulk_create(atrs)
            progress.log(counter)
            atrs = []
        counter += 1
    if atrs:
        ArticleTopicRank.objects.bulk_create(atrs)
    return topic_scores


def aggregateScores():
    progress.reset()
    topic_scores = {k: Decimal(0) for k in range(TOPIC_COUNT)}
    for i in range(TOPIC_COUNT):
        progress.log("{0}/{1}".format(i, TOPIC_COUNT))
        topic_scores[i] = ArticleTopicRank.objects.filter(topic__key=i)\
            .aggregate(Sum('score'))['score__sum']
    return topic_scores


def updateTopicScores(score_dict):
    progress.reset()
    for (topic_key, score) in score_dict.items():
        progress.log("{0}, {1}".format(topic_key, score))
        Topic.objects.filter(key=topic_key).update(score=score)


def main():
    out.log("clearing ATRs and topic scores")
    wipeATRs()
    out.log("creating Atrs")
    scores = createATRs()
    out.log("Setting Topic Scores")
    updateTopicScores(scores)


if __name__ == '__main__':
    main()
