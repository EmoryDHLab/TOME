from Tome.helpers.model_helpers import *
from Tome.helpers.maths import median
from news.models import Article, Corpus
from django.utils.translation import ugettext_lazy as _

class Word(models.Model):
    text = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.text

class Topic(models.Model):
    #every topic belongs to a corpus
    corpus = models.ForeignKey(Corpus, on_delete=models.CASCADE,
        null=True, blank=True)

    # custom id for loading stuff right
    key = models.IntegerField(unique=True, null=True)

    score = models.DecimalField(max_digits=10, decimal_places=10, default=0)

    articles = models.ManyToManyField(Article, through='ArticleTopicRank')
    words = models.ManyToManyField(Word, through='WordTopicRank')
    # years = models.ManyToManyField()

    @property
    def topFive(self):
        return self.getFormattedTopWords(5, False)

    class Meta:
        ordering = ('-score',)

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
        scores = self.articletopicrank_set.all().values('score')
        self.score = median(scores)
        print(self.score)

    def calculateByYears(self):
        atrs = self.articletopicrank_set.all()
        years = {}
        final_scores = {}
        for atr in atrs:
            yr = atr.article.issue.date_published.year
            if (not(yr in years)):
                years[yr] = [atr.score]
            else:
                years[yr].append(atr.score)

        for (year,scores) in years.items():
            final_scores[year] = median(scores)

        return final_scores

    def __str__(self):
        return "Rank: " + str(self.score) +  self.getFormattedTopWords(5)

class WordTopicRank(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=10, decimal_places=10)

    class Meta:
        ordering = ('-score',)
        unique_together = ('word', 'topic')

    def __str__(self):
        return "Topic:" + str(self.topic.pk) + " | Word: " + str(self.word) + " | Score: " + str(self.score)

class ArticleTopicRank(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=10, decimal_places=10)

    class Meta:
        ordering = ('-score',)
        unique_together = ('article', 'topic')

    def __str__(self):
        return "Article: {0} | Topic: {1} | Score: {2}".format(self.article.title,
            self.topic.getFormattedTopWords(3), self.score)
