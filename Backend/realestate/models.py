from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
import uuid


class PropertyType(models.Model):
    """
    Model representing a type of property.

    Examples include apartment, house, villa, land, commercial property, etc.
    Each property can be associated with one property type.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Name of the property type")

    # Could add additional fields like:
    # description = models.TextField(blank=True, null=True, help_text="Description of this property type")
    # icon = models.URLField(blank=True, null=True, help_text="URL to an icon representing this property type")

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = 'Property Type'
        verbose_name_plural = 'Property Types'


class Feature(models.Model):
    """
    Model representing a feature that properties can have.

    Examples include swimming pool, garden, garage, air conditioning, etc.
    Each property can have multiple features.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Name of the feature")

    # Could add additional fields like:
    # description = models.TextField(blank=True, null=True, help_text="Description of this feature")
    # icon = models.URLField(blank=True, null=True, help_text="URL to an icon representing this feature")
    # is_premium = models.BooleanField(default=False, help_text="Whether this is considered a premium feature")

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = 'Feature'
        verbose_name_plural = 'Features'


class Agent(models.Model):
    """
    Model representing a real estate agent.

    An agent is associated with a user account and can list properties.
    Agents have professional details like company affiliation, license number,
    years of experience, and specialization.
    """
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='agent_profile',
        help_text="User account associated with this agent")
    name = models.CharField(max_length=255, help_text="Full name of the agent")

    # Contact information
    phone = models.CharField(max_length=20, help_text="Contact phone number")
    email = models.EmailField(blank=True, null=True, help_text="Contact email address")

    # Profile details
    bio = models.TextField(blank=True, null=True, 
                          help_text="Professional biography and description")
    profile_image = models.URLField(blank=True, null=True, 
                                   help_text="URL to the agent's profile image")

    # Professional details
    company = models.CharField(max_length=255, blank=True, null=True, 
                              help_text="Real estate company or agency affiliation")
    license_number = models.CharField(max_length=100, blank=True, null=True, 
                                     help_text="Professional license or registration number")
    years_of_experience = models.PositiveIntegerField(default=0, 
                                                     help_text="Number of years working as an agent")
    specialization = models.CharField(max_length=255, blank=True, null=True, 
                                     help_text="Area of specialization (e.g., residential, commercial, luxury)")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """
        Auto-populate email from user if not provided.
        """
        if not self.email and self.user and self.user.email:
            self.email = self.user.email
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['name']
        verbose_name = 'Agent'
        verbose_name_plural = 'Agents'

    def get_properties(self):
        """
        Return all properties associated with this agent.
        """
        return House.objects.filter(agent=self)

    def get_property_count(self):
        """
        Return the number of properties associated with this agent.
        """
        return self.get_properties().count()


class House(models.Model):
    """
    Model representing a real estate property listing.

    A property can be for sale or for rent, and can be associated with an agent.
    Properties have various attributes like bedrooms, bathrooms, area, etc.
    They can also have multiple features and images.
    """
    PROPERTY_STATUS_CHOICES = [
        ('for_sale', 'For Sale'),
        ('for_rent', 'For Rent'),
    ]

    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, help_text="Title of the property listing")
    description = models.TextField(help_text="Detailed description of the property")
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Price in USD")

    # Location information
    address = models.CharField(max_length=255, help_text="Physical address of the property")
    location = models.CharField(max_length=255, blank=True, null=True, 
                               help_text="General location area (e.g., neighborhood, district)")

    # Property details
    property_status = models.CharField(
        max_length=20, choices=PROPERTY_STATUS_CHOICES, 
        help_text="Whether the property is for sale or for rent")
    bedrooms = models.PositiveIntegerField(default=1, help_text="Number of bedrooms")
    bathrooms = models.PositiveIntegerField(default=1, help_text="Number of bathrooms")
    area = models.PositiveIntegerField(default=0, help_text="Total area in square feet/meters")

    # Relationships
    property_type = models.ForeignKey(
        PropertyType, on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Type of property (e.g., apartment, house, land)")
    features = models.ManyToManyField(Feature, blank=True, 
                                     help_text="Special features of the property")
    agent = models.ForeignKey(
        Agent, on_delete=models.SET_NULL, null=True, blank=True,
        help_text="Agent responsible for this property")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties',
        help_text="User who created this property listing")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the listing was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the listing was last updated")
    status = models.CharField(max_length=20, default='active', 
                             help_text="Status of the listing (active, pending, sold, etc.)")

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'


class PropertyImage(models.Model):
    """
    Model representing an image associated with a property listing.

    Each property can have multiple images. Images are stored as URLs
    pointing to external storage (e.g., AWS S3, Cloudinary).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    house = models.ForeignKey(
        House, on_delete=models.CASCADE, related_name='images',
        help_text="The property this image belongs to")
    image = models.ImageField(upload_to="property_images/", help_text="Image file for the property")

    # Could add additional fields like:
    # is_primary = models.BooleanField(default=False, help_text="Whether this is the main image for the property")
    # caption = models.CharField(max_length=255, blank=True, null=True, help_text="Optional caption for the image")
    # order = models.PositiveIntegerField(default=0, help_text="Display order of the image")

    def __str__(self):
        return f"Image for {self.house.title}"

    class Meta:
        ordering = ['house']
        verbose_name = 'Property Image'
        verbose_name_plural = 'Property Images'


class UserProfile(models.Model):
    """
    Model representing a user's profile with additional information.

    Each user has a profile with a role (tenant, agent, or admin) and additional
    contact information. If a user has the 'agent' role, an Agent profile is
    automatically created for them.
    """
    ROLE_CHOICES = [
        ('tenant', 'Tenant'),
        ('agent', 'Agent'),
        ('admin', 'Admin'),
    ]

    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile',
        help_text="User account associated with this profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='tenant',
                           help_text="User's role in the system")

    # Contact information
    phone_number = models.CharField(max_length=20, blank=True,
                                   help_text="Contact phone number")
    address = models.CharField(max_length=255, blank=True,
                              help_text="Physical address")

    # Profile details
    bio = models.TextField(blank=True, null=True,
                          help_text="User biography or description")
    profile_image = models.URLField(blank=True, null=True,
                                   help_text="URL to the user's profile image")

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"

    def save(self, *args, **kwargs):
        """
        Override save method to automatically create an Agent profile
        when a user's role is set to 'agent'.
        """
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Create an Agent profile if the user is an agent
        if self.role == 'agent' and is_new:
            # Check if agent profile already exists
            if not Agent.objects.filter(user=self.user).exists():
                Agent.objects.create(
                    user=self.user,
                    name=f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username,
                    phone=self.phone_number or ""
                )

    class Meta:
        ordering = ['user__username']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def is_agent(self):
        """
        Check if the user has an agent role.
        """
        return self.role == 'agent'

    def has_agent_profile(self):
        """
        Check if the user has an associated agent profile.
        """
        return Agent.objects.filter(user=self.user).exists()


class Favorite(models.Model):
    """
    Model representing a user's favorite property.

    Users can save properties they are interested in as favorites for easy access later.
    Each user can have multiple favorites, but can only favorite each property once.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites',
        help_text="User who favorited the property")
    house = models.ForeignKey(
        House, on_delete=models.CASCADE, related_name='favorited_by',
        help_text="Property that was favorited")
    created_at = models.DateTimeField(auto_now_add=True, 
                                     help_text="When the property was favorited")

    class Meta:
        unique_together = ('user', 'house')
        ordering = ['-created_at']
        verbose_name = 'Favorite'
        verbose_name_plural = 'Favorites'

    def __str__(self):
        return f"{self.user.username} likes {self.house.title}"

    def get_property_details(self):
        """
        Return basic details about the favorited property.
        """
        return {
            'id': self.house.id,
            'title': self.house.title,
            'price': self.house.price,
            'address': self.house.address,
            'property_status': self.house.property_status,
        }


class PropertyInquiry(models.Model):
    """
    Model representing a tenant's inquiry about a property.

    Tenants can send inquiries to agents about properties they are interested in.
    Agents can respond to these inquiries.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('responded', 'Responded'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inquiries',
        help_text="Tenant who made the inquiry")
    house = models.ForeignKey(
        House, on_delete=models.CASCADE, related_name='inquiries',
        help_text="Property that the inquiry is about")
    message = models.TextField(help_text="Inquiry message from the tenant")
    response = models.TextField(blank=True, null=True, help_text="Response from the agent")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending',
        help_text="Status of the inquiry")
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the inquiry was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the inquiry was last updated")

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Property Inquiry'
        verbose_name_plural = 'Property Inquiries'

    def __str__(self):
        return f"Inquiry from {self.tenant.username} about {self.house.title}"

    def get_agent(self):
        """
        Return the agent associated with the property.
        """
        return self.house.agent
