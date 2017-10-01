from django.contrib import admin

from topics.models import Word, Topic, ArticleTopicRank, WordTopicRank,\
    YearTopicRank

admin.site.register(Word)
admin.site.register(Topic)
admin.site.register(ArticleTopicRank)
admin.site.register(WordTopicRank)
admin.site.register(YearTopicRank)
