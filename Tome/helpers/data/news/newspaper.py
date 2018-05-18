from news.models import Newspaper, Location
from Tome.helpers.data.helpers.metadatafix import getArticleFromLine,\
    METADATA_TITLE
from Tome.helpers.data.helpers.general import BASE_PATH
import datetime
from Tome.helpers.debug import Printer

DATA_BASE_PATH = BASE_PATH
DATA_TITLE = METADATA_TITLE + '_fixed'

DEFAULT_LOCATION = Location.objects.all()[0].id

out = Printer()


def wipePapers():
    '''
    Deletes all the changes
    '''
    Newspaper.objects.all().delete()


def fixTitle(title):
    newTitle = ''
    for character in title:
        if character.isupper():
            newTitle += ' '
        newTitle += character
    return newTitle


def importPapers():
    '''
    Imports the all the articles from a given file
    '''
    f = open(DATA_BASE_PATH + DATA_TITLE + '.csv')
    counter = 0
    papers = {}
    newspapers = []
    for line in f:
        article = getArticleFromLine(line, counter)
        if (article['paper_key'] not in papers):
            papers[article['paper_key']] = article['link'].split('/')[0]
        counter += 1
    for (key, paper) in papers.items():
        title = fixTitle(paper)
        out.log(title)
        newspapers.append(buildPaper(key, title, datetime.date.min))
    Newspaper.objects.bulk_create(newspapers)


def buildPaper(key, title, started):
    return Newspaper(key=key, title=title, date_started=started,
                     location__id=DEFAULT_LOCATION)


def qRun():
    wipePapers()
    importPapers()


def main():
    qRun()
