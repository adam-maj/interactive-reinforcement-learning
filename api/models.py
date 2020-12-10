from django.db import models
# from django.contrib.postgres.fields import ArrayField

class Matrix(models.Model):
    width = models.IntegerField()
    height = models.IntegerField()
    cargo_pickups = models.CharField(max_length=100)
    cargo_dropoffs = models.CharField(max_length=100)
    matrix = models.TextField()

    def decode(self, encoded):
        lists = encoded[1:-1].split('], [')
        decoded = [[float(i.replace('[', '').replace(']', '')) for i in l.split(', ')] for l in lists]
        return decoded

    class Meta:
        verbose_name_plural = "Matrices"

# Model for postgres when I can store fields as arrays
"""
class Matrix(models.Model):
    width = models.IntegerField()
    height = models.IntegerField()
    cargo_pickups = models.ArrayField(models.IntegerField())
    cargo_dropoffs = models.ArrayField(models.IntegerField())
    matrix = models.ArrayField(models.ArrayField(models.IntegerField()))

    class Meta:
        verbose_name_plural = "Matrices"
"""
