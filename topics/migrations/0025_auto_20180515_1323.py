# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-05-15 13:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('topics', '0024_auto_20180515_1259'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='topic',
            index=models.Index(fields=['key', '-score'], name='topics_topi_key_a8262b_idx'),
        ),
    ]
