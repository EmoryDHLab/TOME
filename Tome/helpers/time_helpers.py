import datetime
from django.utils import timezone

def today():
    return datetime.date.today()
def yesterday():
    return datetime.date.today() - datetime.timedelta(1)
def tomorrow():
    return datetime.date.today() + datetime.timedelta(1)
