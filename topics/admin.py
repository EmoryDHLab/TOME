from django.contrib import admin

from topics.models import *

admin.site.register(Word)
admin.site.register(Topic)
admin.site.register(ArticleTopicRank)
admin.site.register(WordTopicRank)
