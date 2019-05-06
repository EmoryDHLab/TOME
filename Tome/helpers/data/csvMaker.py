from topics.models import ArticleTopicRank
from django.db.models import Sum


qset = ArticleTopicRank.objects.values('article__issue__newspaper__title', 'topic__key')\
.annotate(paper_score=Sum('score'))

print(qset)
