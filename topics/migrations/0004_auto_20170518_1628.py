# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-18 16:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('topics', '0003_auto_20170512_1738'),
    ]

    operations = [
        migrations.AlterField(
            model_name='wordtopicrank',
            name='score',
            field=models.DecimalField(decimal_places=10, max_digits=10),
        ),
    ]
