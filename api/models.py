from django.db import models
# from django.contrib.postgres.fields import ArrayField

class LocalMatrix(models.Model):
    width = models.IntegerField()
    height = models.IntegerField()
    cargo_pickups = models.CharField(max_length=100)
    cargo_dropoffs = models.CharField(max_length=100)
    matrix = models.CharField(max_length=1000)

# Model for postgres when I can store fields as arrays
"""
class ProductionMatrix(models.Model):
    width = models.IntegerField()
    height = models.IntegerField()
    cargo_pickups = models.ArrayField(models.IntegerField())
    cargo_dropoffs = models.ArrayField(models.IntegerField())
    matrix = models.ArrayField(models.ArrayField(models.IntegerField()))

    class Meta:
        verbose_name_plural = "Matrices"
"""
