from news.models import Issue, Newspaper
from Tome.helpers.data.helpers.metadatafix import getArticleFromLine,\
    getPubDate
from Tome.helpers.data.helpers.general import BASE_PATH
from Tome.helpers.debug import Printer

DATA_BASE_PATH = BASE_PATH
DATA_TITLE = 'documentMetadata_fixed'

out = Printer()


def wipeIssues():
    Issue.objects.all().delete()


def buildIssue(pub_date, paper):
    return Issue(date_published=pub_date, newspaper_id=paper)


def importIssues():
    f = open(DATA_BASE_PATH + DATA_TITLE + '.csv')
    counter = 0
    issues = {}
    newIssues = []
    for line in f:
        article = getArticleFromLine(line, counter)
        try:
            articleDate = getPubDate(article)
        except ValueError as e:
            out.log(e)
            out.log("Invalid date at line: {0}".format(counter))
            wipeIssues()
            return
        if ((articleDate, article['paper_key']) not in issues):
            out.log(article)
            paper = Newspaper.objects.all().get(key=article['paper_key'])
            issues[(articleDate, article['paper_key'])] = paper.id
        counter += 1
    for (key, paper_id) in issues.items():
        newIssues.append(buildIssue(key[0], paper_id))
    Issue.objects.bulk_create(newIssues)


def main():
    wipeIssues()
    importIssues()


if __name__ == '__main__':
    main()
