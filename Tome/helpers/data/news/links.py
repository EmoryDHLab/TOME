from Tome.helpers.data.helpers.general import BASE_PATH
from news.models import Article
import simplejson as json
import datetime
from Tome.helpers.debug import Printer

DATA_BASE_PATH = BASE_PATH
DATA_TITLE = 'jsoncatalog-orig.txt'

progress = Printer(True)

fixLines = []


def findTitle(line):
    return findRuleBreaker(line, "\"Title\": [\"", '"],')


def findSearchString(line):
    return findRuleBreaker(line, "\"searchstring\": \"", '</a>')


def findRuleBreaker(line, fStr, fEnd):
    start = line.find(fStr) + len(fStr)
    end = line.find(fEnd, start)
    return (start, end)


def fixRuleBreaker(line, finder):
    (start, end) = finder(line)
    ruleBreaker = line[start: end]
    cleanedRuleBreaker = ruleBreaker.replace('"', "'")
    newLine = line[:start] + cleanedRuleBreaker + line[end:]
    return newLine


def fixSearchString(line):
    return fixRuleBreaker(line, findSearchString)


def fixTitle(line):
    return fixRuleBreaker(line, findTitle)


def fixLine(line):
    line = fixTitle(fixSearchString(line))
    return line


def parseLine(line, again=False):
    try:
        return json.loads(line, strict=False)
    except Exception as e:
        if (again):
            raise e
        return parseLine(fixLine(line), True)


def linkArticles():
    f = open(DATA_BASE_PATH + DATA_TITLE)
    ct = 1
    ids = {}
    for line in f:
        article = parseLine(line.strip())
        if (article['TitleID'][0] not in ids):
            print('{}: {}'.format(article['TitleID'][0], article['PaperTitle']))
            ids[article['TitleID'][0]] = 1
        else:
            ids[article['TitleID'][0]] += 1
    return ids
    # article = parseLine(f.readline().strip())
    # for key in article.keys():
    #     print(key)
    # year = int(article['IssueYear'][0]) if article['IssueYear'][0] else 1
    # month = int(article['IssueMonth'][0]) if article['IssueMonth'][0] else 1
    # day = int(article['IssueDay'][0]) if article['IssueDay'][0] else 1
    # date = datetime.date(year, month, day)
    # print(date)
    # print(Article.objects.filter(issue__date_published__year=date.year,
    #                              issue__date_published__month=date.month,
    #                              key=article['TitleID']))
    # print(article['URL'][0])
    # ct += 1
    # print(ct)


def main():
    print(linkArticles())


if __name__ == '__main__':
    main()
