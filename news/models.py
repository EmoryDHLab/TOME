from Tome.helpers.model_helpers import *
from Tome.helpers.time_helpers import *
from django.utils.translation import ugettext_lazy as _

class Newspaper(models.Model):
    # Has a title
    title = models.CharField(max_length=200)

    #!!! Newspaper has a following newspaper (can be null)
    #!!! Newspaper has a previous (can be null)

    # Has a start date:
    date_started = models.DateField('date started', null=False)
    # Has an end date
    date_ended = models.DateField('date ended', null=True, blank=True)
    # Has a location object
    #location =
    def __str__(self):
        return "Newspaper: {0} Started: {1} Ended: {2}".format(self.title,
        self.date_started, self.date_ended)

    def clean(self):
        # Don't allow start date to exceed end date
        if (self.date_ended != None):
            if (self.date_started >= self.date_ended):
                raise ValidationError(_('Newspaper start date must not end ' +
                'before end date'))
        # Newspapers can't start in the future
        if (self.date_started > datetime.date.today()):
            raise ValidationError(_("Newspapers can't start in the future"))
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
    editor = models.CharField(max_length=200)
    # Newspaper has many issues
    newspaper = models.ForeignKey(Newspaper, on_delete=models.CASCADE)

    def clean(self):
        if (self.newspaper != None):
            if (not self.newspaper.isInTimeline(self.date_published)):
                raise ValidationError(_(PUB_TIME_ERROR_TEXT))
            if (len(self.newspaper.issue_set.count(date_published=self.date_published)) > 0):
                raise ValidationError(_(ISSUE_OVERLAP_ERROR))
    def __str__(self):
        return "{0}, Issue: {1} \nDate: {2}".format(self.newspaper.title,
        self.id, self.getDate())

    def getDate(self):
        return str(self.date_published)
# Belongs to issue
class Article(models.Model):
    # Title of article
    title = models.CharField(max_length=200)

    # Link to article text
    link = models.TextField()

    # Issue has many articles
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE)

    def __str__(self):
        return "Article: {0} \nTitle: {1}".format(self.id, self.title)
