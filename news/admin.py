from django.contrib import admin

# Register your models her
from news.models import *

admin.site.register(Newspaper)
admin.site.register(Issue)
admin.site.register(Article)
admin.site.register(Location)
