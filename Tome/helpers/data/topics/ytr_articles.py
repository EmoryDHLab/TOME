from topics.models import YearTopicRank
from news.models import Article
from django.db.models import F, Sum


def main():
    art_dates = Article.objects.values_list('issue__date_published', flat=True)
    counts = {}

    for art in art_dates:
        if (art.year not in counts):
            counts[art.year] = 0
        counts[art.year] += 1

    for (year, count) in counts.items():
        print("{}: {}".format(year, count))
        YearTopicRank.objects.filter(year=year).update(article_count=count)

    for year in counts.keys():
        scr = YearTopicRank.objects.filter(year=year) \
            .aggregate(s=Sum('score'))['s']
        YearTopicRank.objects.filter(year=year) \
            .update(percentage=(100 * F('score') / scr))
