# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-05-16 13:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('topics', '0025_auto_20180515_1323'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='wordtopicrank',
            index=models.Index(fields=['-score'], name='topics_word_score_69579f_idx'),
        ),
    ]