# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-05-29 14:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('topics', '0033_auto_20180525_1425'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='topic',
            name='topics_topi_score_44d95d_idx',
        ),
        migrations.AddIndex(
            model_name='topic',
            index=models.Index(fields=['rank'], name='topics_topi_rank_074662_idx'),
        ),
    ]
