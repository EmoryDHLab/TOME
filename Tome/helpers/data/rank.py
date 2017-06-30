from news.models import *
from topics.models import *

def wipeRanks():
    Topic.objects.all().update(rank=-1)
    YearTopicRank.objects.all().update(rank=-1)

def generateRanks():
    i = 0
    ts = Topic.objects.all()
    ytrs = YearTopicRank.objects.all()
    tCount = len(ts)
    ytrCount = len(ytrs)
    mx = max([tCount, ytrCount])

    while (i < tCount):
        t = ts[i]
        t.rank = i
        t.save(update_fields=["rank"])
        i += 1

    i = 0
    rnk = 0
    last_yr = ytrs[0].year
    while (i < ytrCount):
        ytr = ytrs[i]
        if (ytr.year != last_yr):
            last_yr = ytr.year
            rnk = 0
        print(rnk)
        ytr.rank = rnk
        ytr.save(update_fields=["rank"])
        rnk += 1
        i += 1

def qRun():
    wipeRanks()
    generateRanks()

def main():
    qRun()

if __name__ == '__main__':
    main()
