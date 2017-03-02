from Tome.helpers.test_helpers import *
from Tome.helpers.time_helpers import *
from .models import *

class NewspaperModelTests(TestCase):
    def test_has_title(self):
        descTest("All newspapers need a title")
        paper = Newspaper(title="", date_started=timezone.now())
        self.assertRaises(ValidationError, paper.save)

    def test_title_is_title(self):
        descTest("Title given is title output")
        t = "Test Title"
        paper = Newspaper(title=t, date_started=timezone.now())
        paper.save()
        self.assertEquals(Newspaper.objects.get(pk=paper.pk).title, t)

    def test_start_date_not_after_end_date(self):
        descTest("The start date of a newspaper is never before the end date")
        t = "A Valid Title"
        paper = Newspaper(title=t, date_started=today(), date_ended=yesterday())
        self.assertRaises(ValidationError, paper.save)

    def test_start_date_not_in_future(self):
        descTest("The start date of a newspaper cannot be in the future")
        t = "A Valid Title"
        tom2 = tomorrow() + datetime.timedelta(1)
        paper = Newspaper(title=t, date_started=tomorrow(), date_ended=tom2)
        self.assertRaises(ValidationError, paper.save)

class IssueModelTests(TestCase):
    def test_has_editor(self):
        descTest("All issues must have an editor")
        paper = Newspaper(title = "hello", date_started=yesterday())
        paper.save()
        issue = Issue(newspaper=paper, editor='', date_published=today())
        self.assertRaises(ValidationError, issue.save)
    def test_editor_is_editor(self):
        ed = "James Jameserson"
        descTest("The editor name is consistent with the one given")
        paper = Newspaper(title = "hello", date_started=yesterday())
        paper.save()
        issue = Issue(date_published=today(), editor=ed, newspaper=paper)
        issue.save()
        self.assertEquals(issue.editor, Issue.objects.get(pk=issue.pk).editor)
    def test_pub_date_in_newspaper_timespan(self):
        ed = "James Jameserson"
        descTest("The publication date must be inside the newspaper's lifetime")
        paper = Newspaper(title="hello", date_started=today())
        paper.save()
        issue = Issue(date_published=yesterday(), editor=ed, newspaper=paper)
        self.assertRaisesRegex(ValidationError, PUB_TIME_ERROR_TEXT, issue.save)
    def test_one_issue_per_date_per_paper(self):
        descTest("Publications in the same newspaper should not occur on the same date")
        paper = Newspaper(title="hello", date_started=today())
        paper.save()
        issue1 = Issue(date_published=yesterday(), editor="T", newspaper=paper)
        issue2 = Issue(date_published=yesterday(), editor="T2", newspaper=paper)
        issue1.save()
        self.assertRaisesRegex(ValidationError, ISSUE_OVERLAP_ERROR, issue2.save)
    def test_multiple_issues_same_date_diff_paper(self):
        descTest("Publications in different newspapers can occur on the same date")
        paper = Newspaper(title="hello", date_started=today())
        paper.save()
        paper2 = Newspaper(title="hi", date_started=today())
        paper2.save()
        issue1 = Issue(date_published=yesterday(), editor="T", newspaper=paper)
        issue2 = Issue(date_published=yesterday(), editor="T2", newspaper=paper2)
        issue1.save()
        issue2.save()
    
