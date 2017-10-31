from django.db import models
from Tome.helpers.exceptions import PUB_TIME_ERROR, ISSUE_OVERLAP_ERROR
from django.core.exceptions import ValidationError
import datetime
from django.utils.translation import ugettext_lazy as _


# validates a model's date ranges
def vali_date(m):
    # Don't allow start date to exceed end date
    if (m.date_ended is not None):
        if (m.date_started >= m.date_ended):
            raise ValidationError(_('Start date must be ' +
                                    'before end date'))
    # Newspapers can't start in the future
    if (m.date_started > datetime.date.today()):
        raise ValidationError(_("Start_date can't be in the future"))


class Location(models.Model):
    """
    Class containing information on locations
    Used to map newspapers.
    """
    """
    state: the name of the state
        > Type: String
        > Default: "New York"
        > Max Length: 200 characters
    latitude  [Decimal] showing the latitude to plot on maps
    longitude [Decimal]:
    """

    # [CharField] the name of a city. length <=200 chars| default: "New York"
    city = models.CharField(max_length=200, default="New York")
    # [CharField] the name of a state. length <=200 chars| default: "New York"
    state = models.CharField(max_length=200, default="New York")
    # [Decimal] latitude of location. + is N, - is S. Rounded to 4 places
    latitude = models.DecimalField(max_digits=7, decimal_places=4,
                                   default=40.7128)
    # [Decimal] longitude of location. + is E, - is W. Rounded to 4 places
    longitude = models.DecimalField(max_digits=7, decimal_places=4,
                                    default=-74.0059)

    class Meta:
        """Nested class to make sure we never put the same city in twice"""
        unique_together = ("city", "state")

    def toJSON(self):
        """
        Converts location into JSON Object
        Return a dictionary to converted to JSON later using json.dumps
        DOES NOT RETURN VALID JSON IMMEDIATELY
        Example format:
        {
            "city": "New York",
            "state": "New York",
            "lat": Decimal('40.7128'),
            "lng": Decimal('-74.0059')
        }
        """
        tempD = {}
        tempD["city"] = self.city
        tempD["state"] = self.state
        tempD["lat"] = self.latitude
        tempD["lng"] = self.longitude
        return tempD

    def __str__(self):
        """
        Converts location into string of the form 'self.city, self.state'
        Example: "New York, New York"
        """
        return "{0}, {1}".format(self.city, self.state)


class Corpus(models.Model):
    """
    A titled set of all newspapers associated with a dataset.
    Has a description, as well as a date range
    """
    # [CharField] title of the corpus. length <=500
    title = models.CharField(max_length=500)

    # [topics.Topic] a m2m relationship to Topic through a YearTopicRank
    topics = models.ManyToManyField('topics.Topic',
                                    through='topics.YearTopicRank')
    # [TextField] a description of the corpus
    description = models.TextField()

    """
    The following 2 may be redundant, and should be taken out eventually
    """
    # [Date] the earliest date in the corpus. **Must be defined.
    date_started = models.DateField("date started", null=False, blank=True)
    # [Date] the latest date in the corpus. Can be null
    date_ended = models.DateField("date ended", null=True, blank=True)

    def __str__(self):
        """
        Converts Corpus into string of the form 'self.title'
        Example: "The National AntiSlavery Standard"
        """
        return self.title

    def getTopicByRank(self, rank):
        """
        Gets a topic with a given rank from the corpus
        @throws TypeError if rank is not an integer
        @throws ValueError if rank is not in the range of the topics
        """
        if (not isinstance(rank, int)):
            raise TypeError(str(rank) + " is not an integer")
        if (rank > 100 or rank < 1):
            # TODO: change upper bound to topics.distinct().length - 1
            raise ValueError(str(rank) + " is not in the range [1, 100]")
        else:
            return self.getTopics()[rank-1]

    def getTopicsByRank(self, highest=1, lowest=100):
        """
        Returns all topics within a certain range of ranks
        @param lowest  : the lowest rank (defaults to 100)
        @param highest : the highest rank (defaults to 1)
        @throws ValueError if the range is impossible
        """
        if ((highest > 100) or (highest < 1)
                or (lowest > 100) or (lowest < 1)
                or (highest > lowest)):
            msg = "Invalid rank range. Check your highest and lowest"
            raise ValueError(msg)
        else:
            return self.getTopics()[highest-1:lowest]

    def getTopics(self):
        """
        Returns all distinct topics in the corpus
        """
        return self.topics.distinct().order_by('rank')

    def getTopicsByYear(self, yr):
        """
        Returns all topics in a given year as a list of json-able topic dicts
        @param yr : the year from which to get topics
        """
        # get a list of ytrs in the given year
        topics = self.yeartopicrank_set.filter(year=yr).order_by("-score")
        json_tops = []
        # for each ytr, get the topic
        for t in topics:
            # convert the topic to a dict for later json use
            tJs = t.toJSON()
            # add it to the list
            json_tops.append(tJs)
        return json_tops

    def getYearsTopics(self):
        """
        Gets all topics by year and puts them in a dict w/ the year as the key
        """
        # get the earliest year
        start_yr = self.date_started.year
        # get the latest year
        end_yr = self.date_ended.year
        dates = {}
        # for each year in the corpus
        for current_yr in range(start_yr, end_yr + 1):
            # add the topic to the list
            dates[current_yr] = self.getTopicsByYear(current_yr)
        return dates

    def clean(self):
        """Validator for the corpus"""
        # Validate the dates
        vali_date(self)
        # Don't allow corpus to exist without title
        if (self.title == "" or self.title is not None):
            raise ValidationError(_('Newspaper must have a title'))


class Newspaper(models.Model):
    """
    Newspaper holds a list of issues and belongs to a corpus. It also has a
    location
    """
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
    # options for frequency
    WEEKLY = "WK"
    MONTHLY = "MN"
    OTHER = "OT"
    # available publishing frequencies
    FREQUENCY_CHOICES = (
        (WEEKLY, 'weekly'),
        (MONTHLY, 'monthly'),
        (OTHER, 'other'),
    )
    # [CharField] limited to the choices above
    frequency = models.CharField(
        max_length=2,
        choices=FREQUENCY_CHOICES,
        default=OTHER,
    )

    def __str__(self):
        """
        Returns a string version of the Newspaper
        Example:
        "Newspaper: AntiSlavery Standard Started: 01-01-1999 Ended: 01-02-2000"
        """
        s = "Newspaper: {0} Started: {1} Ended: {2}"
        s = s.format(self.title, self.date_started, self.date_ended)
        return s

    def clean(self):
        """
        Validates the newspaper
        """
        # Validate the dates
        vali_date(self)
        # Don't allow paper to exist without title
        if (self.title == "" or self.title is not None):
            raise ValidationError(_('Newspaper must have a title'))

    def isActive(self):
        """
        Returns whether the newspaper is still publishing today (no end date)
        """
        return self.date_ended is not None

    def isInTimeline(self, date):
        """
        Returns whether a date is within a given timeline
        @param date : the date to confirm
        """
        if (date < self.date_started):
            return False
        if (self.isActive()):
            if (date > self.date_ended):
                return False
        return True


class Issue(models.Model):
    """A collection of articles from the same date from the same newspaper"""
    # has a date of publication
    date_published = models.DateField('date published')
    # one editor per Issue -- need better data
    editor = models.CharField(max_length=200, null=True, blank=True)
    # Newspaper has many Issues
    newspaper = models.ForeignKey(Newspaper, on_delete=models.CASCADE)

    def clean(self):
        """Validates the Issue"""
        if (self.newspaper is not None):
            set_filter = self.newspaper.issue_set.filter(
                            date_published=self.date_published)
            if (not self.newspaper.isInTimeline(self.date_published)):
                raise ValidationError(_(PUB_TIME_ERROR))
            if (len(set_filter) > 0):
                raise ValidationError(_(ISSUE_OVERLAP_ERROR))

    def __str__(self):
        """Returns the string representation of an Issue"""
        return "{0}, Issue: {1} \nDate: {2}".format(self.newspaper.title,
                                                    self.pk, self.getDate())

    def getDate(self):
        """Gets the string version of the Issue's date"""
        return str(self.date_published)

    class Meta:
        """Nested class to order Issues by date"""
        ordering = ('date_published',)


class Article(models.Model):
    """Article holds a title given by metadata, as well as an archive link"""
    # custom id for loading stuff right
    key = models.IntegerField(unique=True, null=True)
    # Title of article
    title = models.CharField(max_length=500, default="", blank=True, null=True)

    # Link to article text
    link = models.URLField(max_length=500)

    # Issue has many articles
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE)

    class Meta:
        """Nested class to order articles by their issue's date"""
        ordering = ('issue__date_published',)

    @property
    def day(self):
        """Gets the day an article was published"""
        return self.issue.date_published.day

    @property
    def month(self):
        """Gets the month an article was published"""
        return self.issue.date_published.month

    @property
    def year(self):
        """Gets the year an article was published"""
        return self.issue.date_published.year

    @property
    def newspaper(self):
        """Gets the Article's associated paper"""
        return self.issue.newspaper

    def toJSON(self):
        """
        Converts article to a dict which can later be converted to json
        Example format:
        {
            "date" : "01/02/1999",
            "editor" : "James Jamerson",
            "title" : "A Modest Proposal",
            "newspaper" : "Random Newspaper",
            "location" : Location(),
            "link" : "www.website.example"
        }
        """
        tempD = {}
        tempD["date"] = "{0}/{1}/{2}".format(self.month, self.day, self.year)
        if (self.issue.editor is not None):
            tempD["editor"] = self.issue.editor
        else:
            tempD["editor"] = "[Unavailable]"
        if (self.title != ""):
            tempD["title"] = self.title
        else:
            tempD["title"] = "[Article " + str(self.key) + "]"
        tempD["newspaper"] = self.newspaper.title
        tempD["location"] = str(self.newspaper.location)
        tempD["link"] = self.link
        return tempD

    def getTopTopics(self, count, asJSON=False, keys=[]):
        """
        Gets the highest ranked topics within the newspaper and returns them in
        a dictionary
        @param count : the number of topics to get
        @param asJSON : whether the topics should be in their dict form
        @param keys : a list of specific topic keys which *must* be included
        """
        tempD = {}
        if (len(keys) > 0):
            # if there are keys, then get atrs that way
            atrs = self.articletopicrank_set.filter(topic__key__in=keys)
        else:
            # there are no provided keys, so just get a ton of them
            # TODO figure out why this has an empty filter
            atrs = self.articletopicrank_set.filter()
        # limit the atrs to a given count
        atrs = atrs[0:count]
        ct = 0
        for atr in atrs:
            if asJSON:
                # if there the topics need to be jsonable
                tempD[ct] = atr.topic.toJSON(False)
            else:
                # if they don't need to be jsonable
                tempD[ct] = atr.topic
            # set the score as well
            tempD[ct]["atr_score"] = atr.score
            ct += 1
        return tempD

    def __str__(self):
        """Return the string version of the article"""
        return "Article: {0} \nTitle: {1}".format(self.pk, self.title)


class Author(models.Model):
    """Unused, for now. Just ignore this."""
    # Author's Name
    name = models.CharField(max_length=200)

    articles = models.ManyToManyField(Article)

    def getArticleTitles(self, ct=0):
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
        return self.name
