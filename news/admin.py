from django.contrib import admin

# Register your models her
from news.models import Newspaper, Issue, Article, Location, Author, Corpus

admin.site.register(Newspaper)
admin.site.register(Issue)
admin.site.register(Article)
admin.site.register(Location)
admin.site.register(Author)
admin.site.register(Corpus)
