
def readFiles(paths):
    return [open(path) for path in paths]


def lineCounts(files):
    for file in files:
        counter = 0
        for line in file:
            counter += 1
        print(file.name + "\t\t" + str(counter))


def checkArticles(file):
    maxi = -1
    mini = -1
    minline = ""
    maxline = ""
    ct = 0
    for line in file:
        items = line.split(',')[:7]
        length = len(items)
        if maxi == -1:
            maxi = length
            mini = length
        if length > maxi:
            maxi = length
            maxline = ct
        if length < mini:
            mini = length
            minline = ct
        ct += 1
    print("Max: " + str(maxi))
    print("Max Line: " + str(maxline))
    print("Min: " + str(mini))
    print("Min Line: " + str(minline))


def printFirstLines(files):
    for file in files:
        print(file.readline())


def main():
    paths = [
        # article is line number, then topic and score alternate
        '/home/adam/Documents/TomeData/all_newspapers_doc_topics.csv',
        # topic is line number, then article key and score alternate
        '/home/adam/Documents/TomeData/all_newspapers_topics.csv',
        # key, link, paper_key, year, month,
        '/home/adam/Documents/TomeData/documentMetadata_fixed.csv',
        # word, then topic key and score alternating
        '/home/adam/Documents/TomeData/word_to_topics.csv',
    ]
    # files = readFiles(paths)
    # lineCounts(files)
    # files = readFiles(paths)
    # printFirstLines(files)
    # # ct = 0
    # # for line in files[-1]:
    # #     if ct > 3:
    # #         break
    # #         ct += 1
    # #         print(line + "\n")
    files = readFiles(paths)
    ct = 0
    papers = {}
    for line in files[2]:
        cols = line.strip().split(',')
        if (cols[2] not in papers):
            papers[cols[2]] = cols[1]
            print(line)
        ct += 1
    files = readFiles(paths)
    checkArticles(files[2])
    # print()
    # printFirstLine(files[1])
    # print("\n heyo \n")
    # for i in range(2):
    #     print(files[0][i])

# doc_topics links each article to its topics with topic scores
# the line number is the article

# newspaper_topics topics with their words

# documentMetadata: all articles...?
# key, location, paper_key, year, month, ?


if __name__ == '__main__':
    main()
