try:
    from general import parse, getColumnsFromLine
except ImportError as e:
    from Tome.helpers.data.helpers.general import parse, getColumnsFromLine

MIN_WORD_LINE_LENGTH = 201
WORDS_TITLE = 'AntiSlaverytopics-new'
words = {}


def getWordFromLine(line, lineNumber):
    index = line.find(',')
    return line[:index]


def getWordDataFromLine(line, lineNumber):
    word = getColumnsFromLine(line, lineNumber, MIN_WORD_LINE_LENGTH)
    return word


def fixWordLine(wordLine, lineNumber):
    index = wordLine.find(',')
    # get the article from the line and fix it so that we can save it later
    word = getWordDataFromLine(wordLine, lineNumber)[0]
    newLine = word + wordLine[index:]
    if word in words:
        raise ValueError("Word is not unique.")
    else:
        words[word] = 1
    return newLine


def main():
    parse(fixWordLine, WORDS_TITLE)


if __name__ == '__main__':
    main()
