from Tome.helpers.debug import Printer

BASE_PATH = '/home/ahayward3/'

progress = Printer(True)


def getFile(path):
    return open(path)


def createFile(path):
    return open(path, 'w')


def closeFile(file):
    file.close()


def addToNewFile(entry, file):
    file.write(entry + '\n')


def raiseColumnError(lineNumber, length, expected_length):
    msg = 'Entry at line {0} is too short.'
    + '(Expected {1} entries, found {2})'
    msg = msg.format(lineNumber, expected_length, length)
    raise TypeError(msg)


def getColumnsFromLine(line, lineNumber, expected_length):
    columns = line.strip().split(',')
    if len(columns) < expected_length:
        raiseColumnError(lineNumber, len(columns), expected_length)
    return columns


def parse(fixfunc, title):
    orig = getFile(BASE_PATH + title + '.csv')
    nm = createFile(BASE_PATH + title + '_fixed.csv')
    lineNumber = 0
    progress.reset()
    for line in orig:
        skip = False
        try:
            fixedLine = fixfunc(line, lineNumber)
        except ValueError as e:
            skip = True
        except TypeError as e:
            print(e)
            closeFile(nm)
            closeFile(createFile(BASE_PATH + title + '_fixed.csv'))
            return
        if not skip:
            addToNewFile(fixedLine.strip(), nm)
        if (lineNumber % 100 == 0):
            progress.log(lineNumber)
        lineNumber += 1
    progress.log(lineNumber)
    closeFile(nm)
