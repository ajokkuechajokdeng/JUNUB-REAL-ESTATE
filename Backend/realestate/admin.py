from django.contrib import admin
from .models import House, PropertyType, Feature, PropertyImage, Agent, UserProfile, Favorite, PropertyInquiry


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'price', 'address', 'property_status', 'agent', 'created_at')
    search_fields = ('title', 'address', 'description')
    list_filter = ('property_status', 'created_at', 'bedrooms', 'bathrooms', 'agent')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'description', 'price', 'property_status')
        }),
        ('Location', {
            'fields': ('address', 'location')
        }),
        ('Features', {
            'fields': ('bedrooms', 'bathrooms', 'area', 'property_type', 'features')
        }),
        ('Ownership', {
            'fields': ('agent', 'created_by', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'property_count')
    search_fields = ('name',)
    readonly_fields = ('id', 'property_count')

    def property_count(self, obj):
        """Return the number of properties of this type."""
        from .models import House
        return House.objects.filter(property_type=obj).count()

    property_count.short_description = 'Number of Properties'


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'property_count')
    search_fields = ('name',)
    readonly_fields = ('id', 'property_count')

    def property_count(self, obj):
        """Return the number of properties with this feature."""
        from .models import House
        return House.objects.filter(features=obj).count()

    property_count.short_description = 'Number of Properties'


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'house', 'image', 'get_agent')
    list_filter = ('house__property_status', 'house__agent')
    search_fields = ('house__title', 'house__address', 'image')
    readonly_fields = ('id', 'get_agent')

    def get_agent(self, obj):
        """Return the agent associated with the property."""
        return obj.house.agent if obj.house.agent else "No Agent"

    get_agent.short_description = 'Agent'


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'phone', 'email', 'company', 'license_number', 'years_of_experience', 'property_count')
    search_fields = ('name', 'phone', 'email', 'company', 'license_number', 'specialization')
    list_filter = ('years_of_experience', 'company', 'specialization')
    readonly_fields = ('id', 'property_count')
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'name', 'phone', 'email')
        }),
        ('Professional Details', {
            'fields': ('bio', 'profile_image', 'company', 'license_number', 'years_of_experience', 'specialization')
        }),
        ('Properties', {
            'fields': ('property_count',)
        }),
    )

    def property_count(self, obj):
        """Return the number of properties associated with this agent."""
        from .models import House
        return House.objects.filter(agent=obj).count()

    property_count.short_description = 'Number of Properties'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'role', 'phone_number', 'address', 'has_agent_profile')
    search_fields = ('user__username', 'user__email', 'phone_number', 'address', 'bio')
    list_filter = ('role',)
    readonly_fields = ('id', 'has_agent_profile')
    fieldsets = (
        ('User Information', {
            'fields': ('id', 'user', 'role')
        }),
        ('Contact Details', {
            'fields': ('phone_number', 'address')
        }),
        ('Profile', {
            'fields': ('bio', 'profile_image')
        }),
        ('Agent Status', {
            'fields': ('has_agent_profile',)
        }),
    )

    def has_agent_profile(self, obj):
        """Check if the user has an agent profile."""
        from .models import Agent
        return Agent.objects.filter(user=obj.user).exists()

    has_agent_profile.boolean = True
    has_agent_profile.short_description = 'Has Agent Profile'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'house', 'property_status', 'agent', 'created_at')
    list_filter = ('house__property_status', 'house__agent', 'created_at')
    search_fields = ('user__username', 'user__email', 'house__title', 'house__address')
    readonly_fields = ('id', 'created_at', 'property_status', 'agent')

    def property_status(self, obj):
        """Return the status of the property."""
        return obj.house.property_status

    def agent(self, obj):
        """Return the agent of the property."""
        return obj.house.agent if obj.house.agent else "No Agent"

    property_status.short_description = 'Property Status'
    agent.short_description = 'Agent'

@admin.register(PropertyInquiry)
class PropertyInquiryAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'house', 'status', 'created_at', 'updated_at', 'get_agent')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('tenant__username', 'tenant__email', 'house__title', 'message', 'response')
    readonly_fields = ('id', 'created_at', 'updated_at', 'get_agent')
    fieldsets = (
        ('Inquiry Details', {
            'fields': ('id', 'tenant', 'house', 'status')
        }),
        ('Messages', {
            'fields': ('message', 'response')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
        ('Agent', {
            'fields': ('get_agent',)
        }),
    )

    def get_agent(self, obj):
        """Return the agent associated with the property."""
        agent = obj.get_agent()
        return agent.name if agent else "No Agent"

    get_agent.short_description = 'Agent'

# Register your models here.
