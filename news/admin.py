from django.contrib import admin

# Register your models here.
from django.contrib import admin
from news.models import *

admin.site.register(Newspaper)
admin.site.register(Issue)
admin.site.register(Article)
