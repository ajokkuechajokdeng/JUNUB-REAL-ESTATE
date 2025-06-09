from rest_framework import serializers
from django.contrib.auth.models import User
from .models import House, PropertyType, Feature, PropertyImage, Agent, UserProfile, Favorite
from django.contrib.auth.password_validation import validate_password


class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyType
        fields = ['id', 'name']


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['id', 'name']


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image']


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'name', 'phone']


class HouseSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'address']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'first_name', 'last_name', 'profile']


class FavoriteSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password2', 'phone_number', 'address')
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
        username = email  # Always set username to email
        user = User.objects.create(
            username=username,
            email=email,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        UserProfile.objects.create(
            user=user,
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            role='tenant'  # Explicitly set role to 'tenant' on registration
        )
        return user

# Add other serializers as needed for additional models
