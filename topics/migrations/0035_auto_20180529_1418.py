# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-05-29 14:18
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('topics', '0034_auto_20180529_1417'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='topic',
            options={'ordering': ('rank',)},
        ),
    ]
