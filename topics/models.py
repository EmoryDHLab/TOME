from Tome.helpers.model_helpers import *
from news.models import Article
from django.utils.translation import ugettext_lazy as _

class Word(models.Model):
    text = models.CharField(max_length=200, unique=True)
    
class Topic(models.Model):
    articles = models.ManyToManyField(Article, through='ArticleTopicRank')
    words = models.ManyToManyField(Word, through='WordTopicRank')

class WordTopicRank(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    rank = models.DecimalField(max_digits=5, decimal_places=5)

    class Meta:
        unique_together = ('word', 'topic')

class ArticleTopicRank(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    rank = models.DecimalField(max_digits=5, decimal_places=5)

    class Meta:
        unique_together = ('article', 'topic')
