# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 21:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='newspaper',
            name='date_ended',
            field=models.DateField(null=True, verbose_name='date ended'),
        ),
        migrations.AddField(
            model_name='newspaper',
            name='date_started',
            field=models.DateField(null=True, verbose_name='date started'),
        ),
        migrations.AlterField(
            model_name='issue',
            name='date_published',
            field=models.DateField(verbose_name='date published'),
        ),
    ]