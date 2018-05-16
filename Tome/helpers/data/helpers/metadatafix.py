import datetime
try:
    from general import parse, getColumnsFromLine
except ImportError as e:
    from Tome.helpers.data.helpers.general import parse, getColumnsFromLine

ARTICLE_MIN_COLUMNS = 6
MONTHLY_PAPERS = [0, 4]

DEFAULT_DAY = 1
DEFAULT_MONTH = 1

METADATA_TITLE = 'documentMetadata'


articleKeys = {}


def getPubDate(article):
    day = article['day'] if (article['day'] > 0) else DEFAULT_DAY
    return datetime.date(article['year'], article['month'], day)


def getArticleFromLine(line, lineNumber):
    article = {}
    columns = getColumnsFromLine(line, lineNumber, ARTICLE_MIN_COLUMNS)
    key = int(columns[0])
    link = columns[1]
    p_key = int(columns[2])
    year = int(columns[3])
    month = int(columns[4])
    article['key'] = key
    article['link'] = link
    article['paper_key'] = p_key
    article['year'] = year
    article['month'] = month if (month != 0) else DEFAULT_MONTH
    if (article['paper_key'] not in MONTHLY_PAPERS):
        article['day'] = int(columns[5])
        article['title'] = ','.join(columns[6:])
    else:
        article['day'] = -1
        article['title'] = ','.join(columns[6:])
    return article


def fixArticleLine(articleLine, lineNumber):
    newLine = "{0},{1},{2},{3},{4},{5},{6}"
    # get the article from the line and fix it so that we can save it later
    article = getArticleFromLine(articleLine, lineNumber)
    if article["key"] in articleKeys:
        raise ValueError("Article is not unique.")
    else:
        articleKeys[article['key']] = 1
    return newLine.format(article['key'], article['link'],
                          article['paper_key'], article['year'],
                          article['month'], article['day'], article['title'])


def main():
    parse(fixArticleLine, METADATA_TITLE)


if __name__ == '__main__':
    main()
