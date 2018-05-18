from topics.models import Word
from Tome.helpers.data.helpers.wordfix import getWordFromLine, WORDS_TITLE
from Tome.helpers.data.helpers.general import BASE_PATH
from Tome.helpers.debug import Printer

progress = Printer(True)


def wipeWords():
    Word.objects.all().delete()


def buildWord(text):
    return Word(text=text)


def importWords():
    f = open(BASE_PATH + WORDS_TITLE + '_fixed.csv')
    counter = 0
    words = []
    progress.reset()
    for line in f:
        words.append(buildWord(getWordFromLine(line, counter)))
        if (counter % 100000 == 0):
            progress.log(counter)
            Word.objects.bulk_create(words)
            words = []
        counter += 1
    if words:
        Word.objects.bulk_create(words)


def main():
    wipeWords()
    importWords()


if __name__ == '__main__':
    main()
