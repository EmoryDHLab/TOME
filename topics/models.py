from Tome.helpers.model_helpers import *
from Tome.helpers.maths import median
from django.utils.translation import ugettext_lazy as _

import simplejson as json

class Word(models.Model):
    text = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.text

class Topic(models.Model):
    # custom id for loading stuff right
    key = models.IntegerField(unique=True, null=True)

    score = models.DecimalField(max_digits=10, decimal_places=10, default=0)

    articles = models.ManyToManyField('news.Article', through='ArticleTopicRank')
    words = models.ManyToManyField(Word, through='WordTopicRank')
    rank = models.IntegerField(default=-1)

    @property
    def topFive(self):
        return self.getFormattedTopWords(5, False)

    @property
    def topTen(self):
        return self.getFormattedTopWords(10, False)
    class Meta:
        ordering = ('-score',)

    def aggregateScoreByLocation(self, loc_id):
        atrs = self.articletopicrank_set.filter(article__issue__newspaper__location__id=loc_id);
        return median(atrs.values_list('score',flat=True))

    def toJSON(self, nested=False, includeArticles=True):
        tempD = {'words' : []}
        tempD["key"] = self.key
        tempD["score"] = self.score
        tempD["rank"] = self.rank
        words = self.wordtopicrank_set.all()
        for word in words:
            tempD["words"].append(word.toJSON(nested))

        if (includeArticles):
            tempD['articles'] = []
            articles = self.articletopicrank_set.all()[:10]
            for article in articles:
                tempD["articles"].append(article.toJSON(nested))

        if (not nested):
            return json.dumps(tempD)
        else:
            return tempD

    def getFormattedTopWords(self, max_words, bracket=True):
        words = self.words.all()
        words_out = []
        brk = ("","")
        for i in range(max_words):
            if (i >= len(words)):
                break
            words_out.append(str(words[i]))
        if (bracket):
            brk = (" [","]")
        return brk[0] + ", ".join(words_out) + brk[1]

    def calculateScore(self):
        scores = self.articletopicrank_set.all().values_list('score',flat=True)
        self.score = median(scores)
        print(self.score)

    def __str__(self):
        return "Rank: " + str(self.rank) +  self.getFormattedTopWords(10)

class WordTopicRank(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=10, decimal_places=10)

    class Meta:
        ordering = ('-score',)
        unique_together = ('word', 'topic')

    def toJSON(self, nested=False):
        tempD = {}
        tempD["word"] = self.word.text
        tempD["score"] = self.score
        tempD["topic"] = self.topic.key
        if (not nested):
            return json.dumps(tempD)
        else:
            return tempD

    def __str__(self):
        return "Topic:" + str(self.topic.pk) + " | Word: " + str(self.word) + " | Score: " + str(self.score)

class ArticleTopicRank(models.Model):
    article = models.ForeignKey('news.Article', on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=10, decimal_places=10)

    class Meta:
        ordering = ('-score',)
        unique_together = ('article', 'topic')

    def toJSON(self, nested=False):
        tempD = {}
        tempD["topic"] = self.topic.key
        tempD["article"] = self.article.id
        tempD["score"] = self.score
        tempD["year"] = self.article.year
        if (not nested):
            return json.dumps(tempD)
        else:
            return tempD

    def __str__(self):
        return "Article: {0} | Topic: {1} | Score: {2}".format(self.article.title,
            self.topic.getFormattedTopWords(3), self.score)

class YearTopicRank(models.Model):
    #every YTR belongs to a corpus
    corpus = models.ForeignKey('news.Corpus', on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    year = models.IntegerField()
    score = models.DecimalField(max_digits=10, decimal_places=10)
    rank = models.IntegerField(default=-1)

    class Meta:
        ordering = ('year', '-score')
        unique_together = ('year','topic')

    def calculateScore(self):
        scores = self.topic.articletopicrank_set.filter(
            article__issue__date_published__year=self.year).values_list('score',
            flat=True)
        self.score = median(scores)

    def toJSON(self, nested=False):
        tempD = {}
        tempD["topic"] = self.topic.key
        tempD["year"] = self.year
        tempD["score"] = self.score
        tempD["rank"] = self.rank
        if (not nested):
            return json.dumps(tempD)
        else:
            return tempD
    def __str__(self):
        return str(self.year) + ": " + str(self.score)
