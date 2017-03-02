import importlib
from django.test import TestCase
from Tome.helpers.exceptions import *
import sys

def descTest(s):
    sys.stdout.write('\n'+ s +": ")
