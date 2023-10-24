# Generated by Django 2.2 on 2023-05-30 07:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contact',
            name='email',
        ),
        migrations.AddField(
            model_name='contact',
            name='message',
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name='contact',
            name='number',
            field=models.CharField(max_length=10),
        ),
    ]