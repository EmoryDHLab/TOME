from Tome.helpers.model_helpers import *
from Tome.helpers.time_helpers import *
from django.utils.translation import ugettext_lazy as _

# validates a model's date ranges
def vali_date(m):
    # Don't allow start date to exceed end date
    if (m.date_ended != None):
        if (m.date_started >= m.date_ended):
            raise ValidationError(_('Start date must be ' +
            'before end date'))
    # Newspapers can't start in the future
    if (m.date_started > datetime.date.today()):
        raise ValidationError(_("Start_date can't be in the future"))

class Location(models.Model):
    city = models.CharField(max_length=200, default="New York")
    state = models.CharField(max_length=200, default="New York")

    class Meta:
        unique_together = ("city","state")

    def __str__(self):
        return "{0}, {1}".format(self.city, self.state)

class Corpus(models.Model):
    # has a title
    title = models.CharField(max_length=500)

    topics = models.ManyToManyField('topics.Topic', through='topics.YearTopicRank')

    # has a description
    description = models.TextField()

    # has a date range
    date_started = models.DateField("date started", null=False, blank=True)
    date_ended = models.DateField("date ended", null=True, blank=True)

    def __str__(self):
        return self.title

    def getTopicByRank(self, rank):
        if (rank > 100 or rank < 1):
            raise
        else:
            return self.getTopics()[rank-1]

    def getTopicsByRank(self, start=1, end=100):
        if (start > 100 or start < 1 or end > 100 or end < 1 or start > end):
            raise
        else:
            return self.getTopics()[start-1:end]

    def getTopics(self):
        return self.topics.distinct()

    def getTopicsByYear(self, yr):
        return list(self.yeartopicrank_set.filter(year=yr).order_by("-score").values_list("topic__key", flat = True))

    def getYearsTopics(self):
        start_yr = self.date_started.year
        end_yr = self.date_ended.year
        dates = {}
        for current_yr in range(start_yr, end_yr + 1):
            dates[current_yr] = self.getTopicsByYear(current_yr)
        return dates
    def clean(self):
        # Validate the dates
        vali_date(self)
        # Don't allow corpus to exist without title
        if (self.title == "" or self.title == None):
            raise ValidationError(_('Newspaper must have a title'))

class Newspaper(models.Model):
    # custom id for loading stuff right
    key = models.IntegerField(unique=True, null=True)
    # Belongs to a Corpus
    corpus = models.ForeignKey(Corpus, on_delete=models.CASCADE,
        null=True, blank=True)

    # Has a title
    title = models.CharField(max_length=500)

    # Location
    # Has a location object
    location = models.ForeignKey(Location, on_delete=models.CASCADE, default=1)

    # Newspaper has a previous (can be null)
    prev_paper = models.ForeignKey('self', related_name="+", default=None,
        null=True, blank=True)
    # Newspaper has a following newspaper (can be null)
    next_paper = models.ForeignKey('self', related_name="+", default=None,
        null=True, blank=True)

    # Has a start date:
    date_started = models.DateField('date started', null=False)
    # Has an end date
    date_ended = models.DateField('date ended', null=True, blank=True)

    WEEKLY = "WK"
    MONTHLY = "MN"
    OTHER = "OT"
    FREQUENCY_CHOICES = (
        (WEEKLY, 'weekly'),
        (MONTHLY, 'monthly'),
        (OTHER, 'other'),
    )
    frequency = models.CharField(
        max_length=2,
        choices=FREQUENCY_CHOICES,
        default=OTHER,
    )

    def __str__(self):
        return "Newspaper: {0} Started: {1} Ended: {2}".format(self.title,
        self.date_started, self.date_ended)

    def clean(self):
        # Validate the dates
        vali_date(self)
        # Don't allow paper to exist without title
        if (self.title == "" or self.title == None):
            raise ValidationError(_('Newspaper must have a title'))
    def isActive(self):
        return self.date_ended != None
    def isInTimeline(self, date):
        if (date < self.date_started):
            return False
        if (self.isActive()):
            if (date > self.date_ended):
                return False
        return True

# Issue belongs to Newspaper
class Issue(models.Model):
    # has a date of publication
    date_published = models.DateField('date published')
    # one editor per Issue -- need better data
    editor = models.CharField(max_length=200, null=True, blank=True)
    # Newspaper has many issues
    newspaper = models.ForeignKey(Newspaper, on_delete=models.CASCADE)

    def clean(self):
        if (self.newspaper != None):
            if (not self.newspaper.isInTimeline(self.date_published)):
                raise ValidationError(_(PUB_TIME_ERROR))
            if (len(self.newspaper.issue_set.filter(date_published=self.date_published)) > 0):
                raise ValidationError(_(ISSUE_OVERLAP_ERROR))
    def __str__(self):
        return "{0}, Issue: {1} \nDate: {2}".format(self.newspaper.title,
        self.pk, self.getDate())

    def getDate(self):
        return str(self.date_published)

    class Meta:
        ordering = ('date_published',)

# Belongs to issue
class Article(models.Model):
    # custom id for loading stuff right
    key = models.IntegerField(unique=True, null=True)
    # Title of article
    title = models.CharField(max_length=500, default="",blank=True,null=True)

    # Link to article text
    link = models.URLField(max_length=500)

    # Issue has many articles
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE)

    class Meta:
        ordering = ('issue__date',)
    def __str__(self):
        return "Article: {0} \nTitle: {1}".format(self.pk, self.title)

# Has an belongs to many Articles
class Author(models.Model):
    # Author's Name
    name = models.CharField(max_length=200)

    articles = models.ManyToManyField(Article)

    def getArticleTitles(self, ct = 0):
        s = "["
        articles = self.articles.all()
        for i in range(len(articles)):
            if (i >= ct):
                break
            s += "<" + str(articles[i]) + ">"
            if (i != len(articles) - 1):
                s += ", "
        s += "]"
        return s

    def __str__(self):
        return "Author: " + self.name + " Articles: " +self.getArticleTitles(3)
