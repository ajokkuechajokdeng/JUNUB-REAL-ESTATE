from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class PropertyType(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Feature(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Agent(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='agent_profile')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class House(models.Model):
    PROPERTY_STATUS_CHOICES = [
        ('for_sale', 'For Sale'),
        ('for_rent', 'For Rent'),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    address = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    property_status = models.CharField(
        max_length=20, choices=PROPERTY_STATUS_CHOICES)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    area = models.PositiveIntegerField(default=0)
    property_type = models.ForeignKey(
        PropertyType, on_delete=models.SET_NULL, null=True, blank=True)
    features = models.ManyToManyField(Feature, blank=True)
    agent = models.ForeignKey(
        Agent, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, default='active')

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    house = models.ForeignKey(
        House, on_delete=models.CASCADE, related_name='images')
    image = models.URLField()

    def __str__(self):
        return f"Image for {self.house.title}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, default='tenant')  # Add role with default 'tenant'

    def __str__(self):
        return self.user.username


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='favorites')
    house = models.ForeignKey(
        House, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'house')

    def __str__(self):
        return f"{self.user.username} likes {self.house.title}"
