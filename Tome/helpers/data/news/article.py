from Tome.helpers.data.helpers.metadatafix import getArticleFromLine, \
    getPubDate
from news.models import Article, Issue
from Tome.helpers.debug import Printer

DATA_BASE_PATH = '/home/adam/Documents/TomeData/'
DATA_TITLE = 'documentMetadata_fixed'

progress = Printer(True)

articles = []


def wipeArticles():
    '''
    Deletes all the changes
    '''
    Article.objects.all().delete()


def buildArticle(key, title, link, issue):
    title = (title[:497] + '...') if len(title) > 500 else title
    return Article(key=key, title=title, link=link, issue_id=issue)


def importArticles():
    f = open(DATA_BASE_PATH + DATA_TITLE + '.csv')
    counter = 0
    articles = []
    progress.reset()
    for line in f:
        article = getArticleFromLine(line, counter)
        articleDate = getPubDate(article)
        issue_id = Issue.objects.get(newspaper__key=article['paper_key'],
                                     date_published=articleDate).id
        art = buildArticle(article['key'],
                           article['title'],
                           article['link'],
                           issue_id)
        articles.append(art)
        if (counter % 10000 == 0):
            progress.log(counter)
            Article.objects.bulk_create(articles)
            articles = []
        counter += 1
    if articles:
        Article.objects.bulk_create(articles)


def main():
    wipeArticles()
    importArticles()


if __name__ == '__main__':
    main()
