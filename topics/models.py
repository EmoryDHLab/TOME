from Tome.helpers.model_helpers import *
from news.models import Article
from django.utils.translation import ugettext_lazy as _

class Word(models.Model):
    text = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.text

class Topic(models.Model):
    articles = models.ManyToManyField(Article, through='ArticleTopicRank')
    words = models.ManyToManyField(Word, through='WordTopicRank')

    def getFormattedTopWords(self, max_words):
        words = self.words.all()
        words_out = []
        for i in range(max_words):
            if (i >= len(words)):
                break
            words_out.append(str(words[i]))
        return " [" + ", ".join(words_out) +"]"

    def __str__(self):
        return "ID: " + str(self.pk) +  self.getFormattedTopWords(5)

class WordTopicRank(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=5)

    class Meta:
        ordering = ('score',)
        unique_together = ('word', 'topic')

    def __str__(self):
        return "Topic:" + str(self.topic.pk) + " | Word: " + str(self.word) + " | Score: " + str(self.score)

class ArticleTopicRank(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=5)

    class Meta:
        ordering = ('score',)
        unique_together = ('article', 'topic')

    def __str__(self):
        return "Article: {0} | Topic: {1} | Score: {2}".format(self.article.title,
            self.topic.getFormattedTopWords(3), self.score)
