from django.db import models
from django.db.models import Count, Sum
from decimal import Decimal
from news.models import Newspaper


class Word(models.Model):
    """Word wrapper which holds text from a topic model"""
    # [CharField] the text in the word. Must be unique
    text = models.CharField(max_length=200, unique=True)

    def __str__(self):
        """Returns the word as a String"""
        return self.text


class Topic(models.Model):
    """
    The Topic class holds a score associated with all topics.
    Each topic has a key which will always refer to it
    """
    # TODO ensure that each topic belongs to a corpus.
    # custom id for loading stuff right
    key = models.IntegerField(unique=True, null=True)

    # [Decimal] the topic's total score
    score = models.DecimalField(max_digits=16, decimal_places=10, default=0)
    # [Decimal] the topic's percentage in the total model
    percentage = models.DecimalField(
        max_digits=16, decimal_places=10, default=0)
    # [topics.ArticleTopicRank] All articles associated, as well as the score
    articles = models.ManyToManyField(
        'news.Article', through='ArticleTopicRank')
    # [topics.WordTopicRank] All the words contained int the topic
    words = models.ManyToManyField(Word, through='WordTopicRank')
    # [topics.NewspaperTopicPair] Cached values to score by papers faster
    papers = models.ManyToManyField('news.Newspaper',
                                    through='NewspaperTopicPair')
    # [Integer] the topic's rank within the corpus
    rank = models.IntegerField(default=-1)

    @property
    def topFive(self):
        """Gets the top 5 words in the topic"""
        return self.getFormattedTopWords(5, False)

    @property
    def topTen(self):
        """Gets the top 10 words in the topic"""
        return self.getFormattedTopWords(10, False)

    class Meta:
        """Nested class which puts topic in decending order by score"""
        ordering = ('-score',)
        indexes = [
            models.Index(fields=['-score'])
        ]

    def percentByLocation(self, loc_id):
        """
        Returns the topics percentage relevance at a location
        @param loc_id : the id of a location
        """
        ntp_score = self.newspapertopicpair_set.filter(
            newspaper__location__id=loc_id)\
            .aggregate(total_score=Sum('score'))['total_score']
        ct = Newspaper.objects.filter(location__id=loc_id)\
            .aggregate(article_count=Count('issue__article'))['article_count']
        # caluclate the percentage
        raw_perc = 100 * (ntp_score / ct)
        return raw_perc.quantize(Decimal('1.000'))

    def percentByPaper(self, paper_id):
        """
        Gets the topic percentage relative to a newspaper
        @param paper_id : the newspaper
        """
        # get all topics within the given paper
        # atrs = self.articletopicrank_set.filter(
        #     article__issue__newspaper__id=paper_id)
        ntps = self.newspapertopicpair_set.filter(newspaper__id=paper_id)

        # count how many articles there are
        ct = Newspaper.objects.filter(id=paper_id)\
            .aggregate(article_count=Count('issue__article'))['article_count']

        # get a raw percentage by aggregating the scores of the articles
        # then dividing that by the number of articles in total
        # then multiply by 100 to get a percentage
        raw_perc = 100 * (sum(ntps.values_list('score', flat=True)) / ct)
        return raw_perc.quantize(Decimal('1.000'))

    def toJSON(self, includedArticles=10):
        """
        Returns dict representation of the Topic
        @param includeArticles : whether to include articles in the json

        Example format:
        {
            "key" : 1,
            "score" : Decimal('0.01'),
            "words" : [<Word.toJSON()'ed>, <Word.toJSON()ed> , ...],
            "articles" : [<Article.toJSON()'ed>, ...]
        }
        """
        tempD = {'words': []}
        tempD["key"] = self.key
        tempD["id"] = self.id
        tempD["score"] = self.score
        tempD["rank"] = self.rank
        words = self.wordtopicrank_set.filter(rank__lt=10)\
            .order_by('rank')[:10]
        for wtr in words:
            tempD["words"].append(wtr.toJSON())

        if (includedArticles > 0):
            tempD['articles'] = []
            articles = self.articletopicrank_set.all()[:includedArticles]
            for article in articles:
                tempD["articles"].append(article.toJSON())
        return tempD

    def getFormattedTopWords(self, max_words, bracket=True):
        """
        Get the Topic's top words as a string
        @param max_words : the maximum # of words to list
        @param bracket : whether to wrap the word in brackets
        """
        # get all the words
        words = self.getWordList(max_words)
        out = ""
        brk = ("", "")
        # get only up to the max
        count = 0
        for word in words:
            if (count < max_words - 1):
                out += word + ", "
            else:
                out += word
            count += 1
        if (bracket):
            # apply brackets if need be
            brk = (" [", "]")
        return brk[0] + out + brk[1]

    def getWordList(self, length=10):
        words = self.wordtopicrank_set.filter(rank__lt=length) \
            .order_by('rank')\
            .values_list('word__text', flat=True)
        return list(words)

    def calculateScore(self):
        """
        Determine Topic's score by totalling its ArticleTopicRank scores
        """
        scores = self.articletopicrank_set.all().values_list(
            'score', flat=True)
        self.score = sum(scores)

    def __str__(self):
        """Returns the string representation of the topic"""
        return "Rank: " + str(self.rank) + self.getFormattedTopWords(10)


class WordTopicRank(models.Model):
    """
    Pairs a words with topics. Many topics can have the same word,
    and many words can have the same topic.
    There is also an associated score of how relevant the word is to its topic
    """
    # [topics.Word] the associated word
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    # [topics.Topic] the topic with which the word is paired
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    # [Decimal] the score representing how important the word is to the topic
    score = models.DecimalField(max_digits=16, decimal_places=10)
    rank = models.IntegerField(default=-1)

    class Meta:
        """
        Nested class which orders the WTRs by descending score, and forces
        each word-topic pair to be unique (the same word should never appear
        twice in the same topic)
        """
        unique_together = ('word', 'topic')
        indexes = [
            models.Index(fields=['word']),
            models.Index(fields=['topic', 'rank']),
            models.Index(fields=['topic'])
        ]

    def toJSON(self):
        """
        Converts the WordTopicRank to a dict to convert to JSON later
        Example format:
        {
            "word" : "dog",
            "score" : Decimal('0.094'),
            "topic" : 45
            "rank" : 0
        }
        -- Note that 45 is the key corresponding to the topic --
        """
        tempD = {}
        tempD["word"] = self.word.text
        tempD["score"] = self.score
        tempD["topic"] = self.topic.key
        tempD["rank"] = self.rank
        return tempD

    def __str__(self):
        """Converts the WordTopicRank to a string (for debugging)"""
        return "Topic:" + str(self.topic.pk) + " | Word: " + str(self.word) \
            + " | Score: " + str(self.score)


class ArticleTopicRank(models.Model):
    """
    ArticleTopicRank pairs a Topic with an Article with their associated score
    """
    # [news.Article] the article to pair
    article = models.ForeignKey('news.Article', on_delete=models.CASCADE)
    # [topics.Topic] the topic to pair
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    # [Decimal] the score associated
    score = models.DecimalField(max_digits=16, decimal_places=10)

    class Meta:
        """
        Nested class which orders the ATRs by descending score, and forces
        each article-topic pair to be unique (an article should never appear
        twice in the same topic)
        """
        unique_together = ('article', 'topic')
        indexes = [
            models.Index(fields=['topic', '-score'])
        ]

    def toJSON(self):
        """
        Returns the Article Topic rank as JSON
        Example format:
        {
            "topic" : 45,
            "article" : 6590,
            "score" : Decimal('.4004')
            "year" : 1894
        }
        -- note that both topic and article are referred to by their keys --
        """
        tempD = {}
        tempD["topic"] = self.topic.key
        tempD["article"] = self.article.id
        tempD["score"] = self.score
        tempD["year"] = self.article.year
        return tempD

    def __str__(self):
        """
        Returns a string representation of the ATR
        """
        return "Article: {0} | Topic: {1} | Score: {2}".format(
            self.article.key, self.topic.getFormattedTopWords(3), self.score)


class YearTopicRank(models.Model):
    """
    Pairs a year with a topic and scores that topic within that year alone
    """
    # every YTR belongs to a corpus
    corpus = models.ForeignKey('news.Corpus', on_delete=models.CASCADE)
    # [topics.Topic] the topic associated with the given year
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    # [Integer] the given year
    year = models.IntegerField()
    # [Decimal] the score associated with the Topic that year
    score = models.DecimalField(max_digits=16, decimal_places=10)
    # [Integer] the rank of the topic that year
    rank = models.IntegerField(default=-1)

    class Meta:
        """
        Nested class to order by year, then decending score
        Ensures that the given year and Topic will never be paired twice
        """
        ordering = ('year', '-score')
        unique_together = ('year', 'topic')
        indexes = [
            models.Index(fields=['topic']),
            models.Index(fields=['year']),
            models.Index(fields=['year', '-score']),
        ]

    def calculateScore(self):
        """Calculates and sets the score of topic during the given year"""
        scores = self.topic.articletopicrank_set.filter(
            article__issue__date_published__year=self.year).values_list(
                'score', flat=True)
        self.score = sum(scores)

    def toJSON(self):
        """
        Returns the YearTopicRank as a dict for conversion to json later
        Example format:
        {
            "topic" : 1,
            "year" : 1883,
            "score" : Decimal('0.1234'),
            "rank" : 55
        }
        """
        tempD = {}
        tempD["topic"] = self.topic.key
        tempD["year"] = self.year
        tempD["score"] = self.score
        tempD["rank"] = self.rank
        return tempD

    def __str__(self):
        """Returns the YearTopicRank as a string"""
        return str(self.year) + ": " + str(self.score)


class NewspaperTopicPair(models.Model):
    """Caches a topic's score by paper to calculate paper scores faster"""
    # [topics.Topic] the topic associated with the given year
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    # [news.Newspaper] the newspaper to pair the topic with
    newspaper = models.ForeignKey('news.Newspaper', on_delete=models.CASCADE)
    # [Decimal] the score associated with the Topic that year
    score = models.DecimalField(max_digits=16, decimal_places=10, default=0)

    class Meta:
        ordering = ['topic__key', '-score']
        indexes = [
            models.Index(fields=['topic', '-score'])
        ]

    def __str__(self):
        """Returns the string representation of the NTP"""
        return
