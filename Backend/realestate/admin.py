from django.contrib import admin
from .models import House, PropertyType, Feature, PropertyImage, Agent, UserProfile, Favorite


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'price', 'address', 'created_at')
    search_fields = ('title', 'address')
    list_filter = ('created_at',)


@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'house', 'image')


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'phone_number', 'address')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'house', 'created_at')

# Register your models here.
