import Tome.helpers.data.topics.word as word
import Tome.helpers.data.topics.topic as topic
import Tome.helpers.data.topics.atr as atr
import Tome.helpers.data.topics.ytr as ytr
import Tome.helpers.data.topics.rank as rank
from Tome.helpers.debug import DividerPrinter


def main():
    divider = DividerPrinter()
    divider.log("Words")
    word.main()
    divider.log("Topics")
    topic.main()
    divider.log("Article-Topic Ranks")
    atr.main()
    divider.log("Year-Topic Ranks")
    ytr.main()
    divider.log("Topic/Yearly Ranks")
    rank.main()
    divider.log("")


if __name__ == '__main__':
    main()
