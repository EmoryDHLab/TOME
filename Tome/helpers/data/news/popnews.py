import Tome.helpers.data.news.corp as corpus
import Tome.helpers.data.news.location as location
import Tome.helpers.data.news.newspaper as newspaper
import Tome.helpers.data.news.issue as issue
import Tome.helpers.data.news.article as article
from Tome.helpers.debug import DividerPrinter


def main():
    divider = DividerPrinter()
    divider.log("Corpus")
    corpus.main()
    divider.log("Location")
    location.main()
    divider.log("Newspapers")
    newspaper.main()
    divider.log("Issue")
    issue.main()
    divider.log("Article")
    article.main()
    divider.log("DONE")


if __name__ == '__main__':
    main()
