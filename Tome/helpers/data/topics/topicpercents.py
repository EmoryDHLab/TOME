from topics.models import Topic
from news.models import Article
from django.db.models import F


def generatePercentages(article_count):
    Topic.objects.all().update(percentage=(100 * F('score')) / article_count)


def main():
    articount = Article.objects.count()
    generatePercentages(articount)


if __name__ == '__main__':
    main()
