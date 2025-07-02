from rest_framework import serializers
from django.contrib.auth.models import User
from .models import House, PropertyType, Feature, PropertyImage, Agent, UserProfile, Favorite, PropertyInquiry
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class PropertyTypeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = PropertyType
        fields = ['id', 'name']


class FeatureSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Feature
        fields = ['id', 'name']


class PropertyImageSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = PropertyImage
        fields = ['id', 'image']


class AgentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Agent model.

    Provides full representation of agent data including all professional details.
    """
    id = serializers.UUIDField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    property_count = serializers.SerializerMethodField()

    class Meta:
        model = Agent
        fields = [
            'id', 'user_id', 'username', 'name', 'phone', 'email', 
            'bio', 'profile_image', 'company', 'license_number', 
            'years_of_experience', 'specialization', 'property_count'
        ]

    def get_property_count(self, obj):
        """
        Get the number of properties associated with this agent.
        """
        return House.objects.filter(agent=obj).count()


class HouseSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    property_type = PropertyTypeSerializer(read_only=True)
    property_type_id = serializers.PrimaryKeyRelatedField(
        queryset=PropertyType.objects.all(), source='property_type', write_only=True, required=False)
    features = FeatureSerializer(many=True, read_only=True)
    feature_ids = serializers.PrimaryKeyRelatedField(queryset=Feature.objects.all(
    ), source='features', many=True, write_only=True, required=False)
    images = PropertyImageSerializer(many=True, read_only=True)
    agent = AgentSerializer(read_only=True)
    agent_id = serializers.PrimaryKeyRelatedField(
        queryset=Agent.objects.all(), source='agent', write_only=True, required=False)

    class Meta:
        model = House
        fields = ['id', 'title', 'description', 'price', 'address', 'location', 'property_status', 'bedrooms', 'bathrooms', 'area', 'property_type',
                  'property_type_id', 'features', 'feature_ids', 'images', 'agent', 'agent_id', 'created_by', 'created_at', 'updated_at', 'status']
        read_only_fields = ['created_by', 'created_at', 'updated_at',
                            'images', 'features', 'property_type', 'agent']


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'phone_number', 'address', 'role', 'bio', 'profile_image']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'first_name', 'last_name', 'profile']


class FavoriteSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    house = HouseSerializer(read_only=True)
    house_id = serializers.PrimaryKeyRelatedField(
        queryset=House.objects.all(), source='house', write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'house', 'house_id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='tenant', write_only=True)
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    profile_image = serializers.URLField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password2', 
                 'phone_number', 'address', 'role', 'bio', 'profile_image')
        extra_kwargs = {'username': {'required': False}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with that email already exists.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        username = validated_data.get('username', email)  # Use provided username or default to email
        user = User.objects.create(
            username=username,
            email=email,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()

        # Create user profile with role
        UserProfile.objects.create(
            user=user,
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            role=validated_data.get('role', 'tenant'),
            bio=validated_data.get('bio', ''),
            profile_image=validated_data.get('profile_image', '')
        )
        return user

class PropertyInquirySerializer(serializers.ModelSerializer):
    """
    Serializer for the PropertyInquiry model.

    Provides representation of property inquiries with nested house and tenant details.
    """
    id = serializers.UUIDField(read_only=True)
    tenant = UserSerializer(read_only=True)
    house = HouseSerializer(read_only=True)
    house_id = serializers.PrimaryKeyRelatedField(
        queryset=House.objects.all(), source='house', write_only=True)
    agent_name = serializers.SerializerMethodField()

    class Meta:
        model = PropertyInquiry
        fields = [
            'id', 'tenant', 'house', 'house_id', 'message', 'response', 
            'status', 'created_at', 'updated_at', 'agent_name'
        ]
        read_only_fields = ['tenant', 'response', 'status', 'created_at', 'updated_at']

    def get_agent_name(self, obj):
        """
        Get the name of the agent associated with the property.
        """
        agent = obj.get_agent()
        return agent.name if agent else "No Agent"

# Custom token serializers for role-based authentication

class AutoDetectRoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that automatically detects the user's role.
    Adds the role to the token data.
    """
    def validate(self, attrs):
        # First validate credentials using the parent class
        data = super().validate(attrs)

        # Add role to token data if user has a profile
        user = self.user
        if hasattr(user, 'profile'):
            data['role'] = user.profile.role

        return data

class TenantTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer for tenants.
    Validates that the user has a 'tenant' role before issuing a token.
    """
    def validate(self, attrs):
        # First validate credentials using the parent class
        data = super().validate(attrs)

        # Check if the user has a tenant role
        user = self.user
        if not hasattr(user, 'profile') or user.profile.role != 'tenant':
            raise serializers.ValidationError(
                {"detail": "This login endpoint is only for tenants. Please use the appropriate login endpoint for your role."}
            )

        # Add role to token data
        data['role'] = user.profile.role

        return data

class AgentTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer for agents.
    Validates that the user has an 'agent' role before issuing a token.
    """
    def validate(self, attrs):
        # First validate credentials using the parent class
        data = super().validate(attrs)

        # Check if the user has an agent role
        user = self.user
        if not hasattr(user, 'profile') or user.profile.role != 'agent':
            raise serializers.ValidationError(
                {"detail": "This login endpoint is only for agents. Please use the appropriate login endpoint for your role."}
            )

        # Add role to token data
        data['role'] = user.profile.role

        return data

# Add other serializers as needed for additional models
