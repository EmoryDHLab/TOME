from topics.models import ArticleTopicRank, Topic
from django.db.models import Sum
import random

PAPER_TITLES = ['Douglass Monthly', 'National Anti-Slavery Standard']

def spoofQuery():
    spoofList = []
    for title in PAPER_TITLES:
        for i in range(100):
            spoofList.append((title, i, random.randrange(30)))
    return spoofList

def getPaperTopicScores():
    qSet = ArticleTopicRank.objects \
        .values_list('article__issue__newspaper__title', 'topic__key') \
        .annotate(paper_score=Sum('score')) \
        .order_by('article__issue__newspaper__title', 'topic__key')
    return list(qSet)

def q1(filename):
    # ptsSet = getPaperTopicScores()
    print('retrieving data')
    ptsSet = getPaperTopicScores()
    print('crunching data')
    currLine = ""
    f = open('{}.csv'.format(filename), 'w')
    paperSet = {}
    for pts in ptsSet:
        title = pts[0]
        if title not in paperSet:
            print('\tProcessing paper: ', title)
            paperSet[title] = 1
            if (currLine != ""):
                f.write(currLine[0:-2] + '\n')
            currLine = '({}), '.format(title)
        currLine += str(pts[2]) + ', '
    f.write(currLine)
    f.close()

def q2(filename):
    qSet = ArticleTopicRank.objects \
        .filter(article__issue__newspaper__title="National Anti-Slavery Standard", article__issue__date_published__range=["1841-05-20", "1843-05-04"]) \
        .values_list('article__issue__newspaper__title', 'topic__key') \
        .annotate(paper_score=Sum('score')) \
        .order_by('article__issue__newspaper__title', 'topic__key')
    print('retrieving data')
    ptsSet = list(qSet)
    print('crunching data')
    currLine = ""
    f = open('{}.csv'.format(filename), 'w')
    paperSet = {}
    for pts in ptsSet:
        title = pts[0]
        if title not in paperSet:
            print('\tProcessing paper: ', title)
            paperSet[title] = 1
            if (currLine != ""):
                f.write(currLine[0:-2] + '\n')
            currLine = '({}), '.format(title)
        print(pts[1])
        currLine += str(pts[2]) + ', '
    f.write(currLine)
    f.close()

def q3(filename):
    tops = Topic.objects.all().order_by('key')
    f = open('{}.csv'.format(filename), 'w')
    for t in tops:
        print(t.key)
        f.write('({}), {}\n'.format(t.key, t.topTen))
    f.close()

def main():
    # q1()
    # q2('natlAntiSlavery-phony')
    # q3('topWords')

if __name__ == '__main__':
    main()
