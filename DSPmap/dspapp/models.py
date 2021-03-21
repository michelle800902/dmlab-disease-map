from __future__ import unicode_literals

from django.db import models

# Create your models here.
class ptt_contents(models.Model):
    board         = models.TextField(null=True)
    account       = models.TextField(null=True)
    nickname      = models.TextField(null=True)
    title_class   = models.TextField(null=True)
    title_content = models.TextField(null=True)
    tm            = models.DateTimeField(auto_now=False)
    url           = models.TextField(null=True)
    ip            = models.TextField(null=True)
    content       = models.TextField(null=True)
    board2        = models.TextField(null=True)
    signature     = models.TextField(null=True)
    latlng        = models.TextField(null=True)
    def __unicode__(self):
        return self.title
    class Meta:
        # db_table = 'ptt_contents'
        db_table = 'ptt_contents_tmp'
