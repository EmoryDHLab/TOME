from news.models import Newspaper, Article, Issue
import datetime
from django.core.exceptions import ObjectDoesNotExist
from Tome.settings import BASE_DIR
from django.contrib.staticfiles.templatetags.staticfiles import static

'''
    Deletes all the changes
'''
def wipeNews():
    Newspaper.objects.all().delete()
    Issue.objects.all().delete()
    Article.objects.all().delete()

'''
    Imports the all the articles from a given file
'''
def importArticles(file_name):
    url = BASE_DIR + static('Tome/data/' + file_name)
    f = open(url)
    counter = 0
    for line in f:
        line = line.strip()
        if (not line.startswith("#")):
            print(line)
            addArticle(line)
        counter += 1

'''
    Imports a single article from a given line
'''
def addArticle(line):
    items = line.split(",")
    a = Article(key=items[0])
    a.link = items[1]
    try:
        paper = Newspaper.objects.get(key=items[2])
    except ObjectDoesNotExist:
        paper = Newspaper(key=items[2], date_started=datetime.date(1200, 3, 1))
        paper.save()

    print(items[3] + " " + items[4] + " " + items[5])

    issue, saved_i = Issue.objects.get_or_create(date_published=datetime.date(
        int(items[3]), int(items[4]), int(items[5])), newspaper=paper)
    if (not saved_i):
        issue.save()

    a.issue = issue
    a.title = items[6]

    a.save()


def qRun():
    wipeNews()
    importArticles("Multi/multipleDocumentMetadata.csv")


def main():
    qRun()


if __name__ == '__main__':
    main()
