from news.models import *
from topics.models import *
from Tome.helpers.time_helpers import *
from django.core.exceptions import ObjectDoesNotExist
from Tome.settings import BASE_DIR
from django.contrib.staticfiles.templatetags.staticfiles import static

def wipeNews():
    Newspaper.objects.all().delete()
    Issue.objects.all().delete()
    Article.objects.all().delete()

def importArticles(file_name):
    url = BASE_DIR + static('Tome/data/' + file_name)
    f = open(url)
    counter = 0;
    for line in f:
        line = line.strip()
        if (not line.startswith("#")):
            addArticle(line)
        counter+=1

def addArticle(line):
    items = line.split(",")
    a = Article(key=items[0])
    a.link = items[1]
    try:
        paper = Newspaper.objects.get(key=items[2])
    except ObjectDoesNotExist:
        paper = Newspaper(key=items[2], date_started=datetime.date(1200, 3, 1))
        paper.save()

    issue, saved_i = Issue.objects.get_or_create(date_published=
        datetime.date(int(items[3]), int(items[4]), int(items[5])), newspaper=paper)
    if (not saved_i):
        issue.save()

    a.issue = issue
    a.title = items[6]

    a.save()

def qRun():
    wipeNews()
    importArticles("documentMetadata.csv")

def main():
    qRun()

if __name__ == '__main__':
    main()
