from django.db import models
from django.urls import reverse

# Create your models here.


class Contact(models.Model):
    name = models.CharField(max_length=20)
    # email = models.EmailField(max_length=50)
    # number = models.IntegerField(max_length=10)
    number = models.CharField(max_length=10)
    message = models.TextField(default="this is contact's personal number.")

    def get_absolute_url(self):
        # return f"/contacts/{self.id}"
        return reverse("contacts:contact-detail", kwargs={"id": self.id})
