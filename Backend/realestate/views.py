from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import House, PropertyType, Feature, PropertyImage, Agent, UserProfile, Favorite, PropertyInquiry
from .serializers import (
    HouseSerializer, PropertyTypeSerializer, FeatureSerializer, PropertyImageSerializer, AgentSerializer, UserSerializer, UserProfileSerializer, FavoriteSerializer, RegisterSerializer, PropertyInquirySerializer
)
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import TenantTokenObtainPairSerializer, AgentTokenObtainPairSerializer, AutoDetectRoleTokenObtainPairSerializer

# Custom permission classes
class IsTenant(permissions.BasePermission):
    """
    Custom permission to only allow tenants to access a view.
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'profile') and request.user.profile.role == 'tenant'

class IsAgent(permissions.BasePermission):
    """
    Custom permission to only allow agents to access a view.
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'profile') and request.user.profile.role == 'agent'

class HouseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing properties.

    Provides CRUD operations for properties with filtering capabilities.
    Automatically assigns the agent when an agent creates a property.
    """
    queryset = House.objects.all().order_by('-created_at')
    serializer_class = HouseSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'address', 'location', 'description']
    ordering_fields = ['price', 'created_at', 'bedrooms', 'bathrooms', 'area']

    def get_permissions(self):
        """
        Allow anyone to list and retrieve properties.
        Only agents can create, update, and delete properties.
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAgent()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        """
        Set the created_by field to the current user.
        If the user is an agent, automatically set the agent field.
        """
        user = self.request.user

        # Check if user has an agent profile
        try:
            if hasattr(user, 'profile') and user.profile.role == 'agent':
                try:
                    agent = Agent.objects.get(user=user)
                    serializer.save(created_by=user, agent=agent)
                except Agent.DoesNotExist:
                    # Log the error but continue with creating the property
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"User {user.username} has agent role but no agent profile")
                    serializer.save(created_by=user)
            else:
                serializer.save(created_by=user)
        except Exception as e:
            # Log any unexpected errors
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating property: {str(e)}")
            raise

    def get_queryset(self):
        """
        Filter properties based on query parameters.
        """
        queryset = super().get_queryset()
        property_type = self.request.query_params.get('property_type')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        bedrooms = self.request.query_params.get('bedrooms')
        bathrooms = self.request.query_params.get('bathrooms')
        search = self.request.query_params.get('search')
        property_status = self.request.query_params.get('property_status')
        agent_id = self.request.query_params.get('agent_id')

        if property_type:
            queryset = queryset.filter(property_type_id=property_type)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if bedrooms:
            queryset = queryset.filter(bedrooms__gte=bedrooms)
        if bathrooms:
            queryset = queryset.filter(bathrooms__gte=bathrooms)
        if search:
            queryset = queryset.filter(title__icontains=search)
        if property_status:
            queryset = queryset.filter(property_status=property_status)
        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)

        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_properties(self, request):
        """
        Return properties created by the current user.
        """
        houses = House.objects.filter(created_by=request.user)
        serializer = self.get_serializer(houses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def agent_properties(self, request):
        """
        Return properties associated with the current user as an agent.
        Auto-create agent profile if missing.
        """
        user = request.user
        import logging
        logger = logging.getLogger(__name__)

        try:
            # Check if user has a profile and is an agent
            if not hasattr(user, 'profile'):
                logger.warning(f"User {user.username} attempted to access agent properties but has no profile")
                return Response(
                    {"detail": "You do not have a user profile."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if user.profile.role != 'agent':
                logger.warning(f"User {user.username} attempted to access agent properties but is not an agent (role: {user.profile.role})")
                return Response(
                    {"detail": "You must have an agent role to access agent properties."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Auto-create agent profile if missing
            from .models import Agent
            agent, created = Agent.objects.get_or_create(
                user=user,
                defaults={
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'phone': getattr(user.profile, 'phone_number', '') or ''
                }
            )
            if created:
                logger.info(f"Auto-created agent profile for user {user.username}")

            # Get the properties and return them
            houses = House.objects.filter(agent=agent)
            serializer = self.get_serializer(houses, many=True)
            return Response(serializer.data)

        except Exception as e:
            # Log any unexpected errors
            logger.error(f"Error retrieving agent properties for user {user.username}: {str(e)}")
            return Response(
                {"detail": "An error occurred while retrieving your properties."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PropertyTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing property types.

    Provides operations to view property types for all users,
    but only agents can create, update, and delete them.
    """
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer

    def get_permissions(self):
        """
        Allow anyone to list and retrieve property types,
        but only agents can create, update, and delete them.
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAgent()]
        return [permissions.IsAuthenticated()]

class FeatureViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing property features.

    Provides operations to view property features for all users,
    but only agents can create, update, and delete them.
    """
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer

    def get_permissions(self):
        """
        Allow anyone to list and retrieve property features,
        but only agents can create, update, and delete them.
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAgent()]
        return [permissions.IsAuthenticated()]

class PropertyImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing property images.

    Provides operations to add, update, and delete images associated with properties.
    """
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer

    def get_permissions(self):
        """
        Allow anyone to view images, but only agents can create, update, and delete them.
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAgent()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        Filter images based on query parameters.
        """
        queryset = super().get_queryset()
        house_id = self.request.query_params.get('house_id')

        if house_id:
            queryset = queryset.filter(house_id=house_id)

        return queryset

    def perform_create(self, serializer):
        """
        Ensure the user has permission to add images to the property.
        """
        import logging
        logger = logging.getLogger(__name__)
        user = self.request.user

        # Get house_id from request data
        house_id = self.request.data.get('house_id')
        if not house_id:
            logger.warning(f"User {user.username} attempted to upload an image without providing a house_id")
            raise serializers.ValidationError({
                "house_id": "House ID is required to associate the image with a property."
            })

        try:
            # Try to get the house
            try:
                house = House.objects.get(pk=house_id)
            except House.DoesNotExist:
                logger.warning(f"User {user.username} attempted to upload an image for non-existent house {house_id}")
                raise serializers.ValidationError({
                    "house_id": f"Property with ID {house_id} not found."
                })

            # Check permissions
            is_creator = house.created_by == user
            is_agent = house.agent and house.agent.user == user

            if not (is_creator or is_agent):
                logger.warning(
                    f"User {user.username} attempted to upload an image for house {house_id} "
                    f"but is neither the creator nor the agent"
                )
                raise serializers.ValidationError({
                    "permission": "You don't have permission to add images to this property. "
                                 "Only the property creator or the associated agent can add images."
                })

            # Save the image
            logger.info(f"User {user.username} uploading image for house {house_id} as {'creator' if is_creator else 'agent'}")
            serializer.save(house=house)

        except serializers.ValidationError:
            # Re-raise validation errors to be handled by DRF
            raise
        except Exception as e:
            # Log any unexpected errors
            logger.error(f"Error uploading image for house {house_id}: {str(e)}")
            raise serializers.ValidationError({
                "detail": "An error occurred while uploading the image. Please try again later."
            })

class AgentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing real estate agents.

    Provides operations to view agent profiles and their associated properties.
    """
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone']

    def get_permissions(self):
        """
        Allow anyone to list and retrieve agents, but only agents can create, update, and delete profiles.
        """
        if self.action in ['list', 'retrieve', 'agent_properties']:
            return [permissions.AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAgent()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        """
        Ensure agents can only update or delete their own profiles.
        """
        super().check_object_permissions(request, obj)

        # For update and delete operations, check if the agent is the owner of the profile
        if self.action in ['update', 'partial_update', 'destroy']:
            if obj.user != request.user:
                self.permission_denied(
                    request,
                    message="You do not have permission to modify this agent profile. Agents can only modify their own profiles."
                )

    @action(detail=True, methods=['get'])
    def agent_properties(self, request, pk=None):
        """
        Return properties associated with a specific agent.
        """
        agent = self.get_object()
        properties = House.objects.filter(agent=agent)
        serializer = HouseSerializer(properties, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_profile(self, request):
        """
        Return the agent profile of the current user if they are an agent.
        """
        user = request.user
        import logging
        logger = logging.getLogger(__name__)

        try:
            # Check if user has a profile
            if not hasattr(user, 'profile'):
                logger.warning(f"User {user.username} attempted to access agent profile but has no user profile")
                return Response(
                    {"detail": "You do not have a user profile."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if user has agent role
            if user.profile.role != 'agent':
                logger.warning(f"User {user.username} attempted to access agent profile but is not an agent (role: {user.profile.role})")
                return Response(
                    {"detail": "You must have an agent role to access an agent profile."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Try to get the agent profile
            try:
                agent = Agent.objects.get(user=user)
            except Agent.DoesNotExist:
                logger.error(f"User {user.username} has agent role but no agent profile")
                return Response(
                    {"detail": "You have an agent role but no agent profile. Please contact an administrator."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Return the agent profile
            serializer = self.get_serializer(agent)
            return Response(serializer.data)

        except Exception as e:
            # Log any unexpected errors
            logger.error(f"Error retrieving agent profile for user {user.username}: {str(e)}")
            return Response(
                {"detail": "An error occurred while retrieving your agent profile."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FavoriteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing favorite properties.

    Provides operations for tenants to save, view, and manage their favorite properties.
    """
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Save the current user as the owner of the favorite.
        """
        serializer.save(user=self.request.user)

    def get_permissions(self):
        """
        Ensure only tenants can create, update, and delete favorites.
        Anyone authenticated can view their own favorites.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'recommended']:
            return [permissions.IsAuthenticated(), IsTenant()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        """
        Ensure tenants can only update or delete their own favorites.
        """
        super().check_object_permissions(request, obj)

        # For update and delete operations, check if the tenant is the owner of the favorite
        if self.action in ['update', 'partial_update', 'destroy']:
            if obj.user != request.user:
                self.permission_denied(
                    request,
                    message="You do not have permission to modify this favorite. Tenants can only modify their own favorites."
                )

    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """
        Return recommended properties based on user's favorites.
        This is a tenant-specific feature.
        """
        import logging
        logger = logging.getLogger(__name__)

        try:
            # Check if user is a tenant
            if not hasattr(request.user, 'profile') or request.user.profile.role != 'tenant':
                logger.warning(f"User {request.user.username} attempted to access tenant-only feature but is not a tenant")
                return Response(
                    {"detail": "This feature is only available for tenants."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get user's favorites
            favorites = Favorite.objects.filter(user=request.user)

            if not favorites.exists():
                # If no favorites, return some default recommendations
                recommended = House.objects.all().order_by('-created_at')[:5]
            else:
                # Get property types and features from favorites
                favorite_houses = [fav.house for fav in favorites]
                property_types = set(house.property_type for house in favorite_houses if house.property_type)

                # Find similar properties
                recommended = House.objects.filter(
                    property_type__in=property_types
                ).exclude(
                    id__in=[house.id for house in favorite_houses]
                ).order_by('-created_at')[:5]

            serializer = HouseSerializer(recommended, many=True)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error getting recommendations for user {request.user.username}: {str(e)}")
            return Response(
                {"detail": "An error occurred while retrieving recommendations."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def retrieve(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def update(self, request):
        user = request.user
        profile_data = request.data.get('profile', {})
        profile, created = UserProfile.objects.get_or_create(user=user)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'detail': 'Registration successful.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserMeView(APIView):
    """
    Returns the authenticated user's data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AutoDetectRoleTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that automatically detects the user's role.
    Uses the AutoDetectRoleTokenObtainPairSerializer to add the role to the token data.
    """
    serializer_class = AutoDetectRoleTokenObtainPairSerializer


class TenantTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view for tenants.
    Uses the TenantTokenObtainPairSerializer to validate that the user has a 'tenant' role.
    """
    serializer_class = TenantTokenObtainPairSerializer


class AgentTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view for agents.
    Uses the AgentTokenObtainPairSerializer to validate that the user has an 'agent' role.
    """
    serializer_class = AgentTokenObtainPairSerializer


class PropertyInquiryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing property inquiries.

    Provides operations for tenants to create inquiries about properties
    and for agents to respond to inquiries about their properties.

    - Tenants can create inquiries and view, update, or delete their own inquiries
    - Agents can view inquiries about their properties and respond to them
    - Agents cannot update or delete inquiries, only respond to them
    """
    serializer_class = PropertyInquirySerializer

    def get_permissions(self):
        """
        Set permissions based on the action:
        - create, update, delete: tenant only
        - respond: agent only
        - list, retrieve: authenticated user (filtered by role in get_queryset)
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsTenant()]
        elif self.action == 'respond':
            return [permissions.IsAuthenticated(), IsAgent()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        """
        Ensure tenants can only update or delete their own inquiries.
        """
        super().check_object_permissions(request, obj)

        # For update and delete operations, check if the tenant is the owner of the inquiry
        if self.action in ['update', 'partial_update', 'destroy']:
            if obj.tenant != request.user:
                self.permission_denied(
                    request,
                    message="You do not have permission to modify this inquiry. Tenants can only modify their own inquiries."
                )

    def get_queryset(self):
        """
        Return inquiries based on user role:
        - Tenants see their own inquiries
        - Agents see inquiries about their properties
        - Admins see all inquiries
        """
        user = self.request.user
        import logging
        logger = logging.getLogger(__name__)

        # Check if user has a profile
        if not hasattr(user, 'profile'):
            logger.warning(f"User {user.username} attempted to access inquiries but has no profile")
            return PropertyInquiry.objects.none()

        # Return inquiries based on role
        if user.profile.role == 'tenant':
            return PropertyInquiry.objects.filter(tenant=user)
        elif user.profile.role == 'agent':
            try:
                agent = Agent.objects.get(user=user)
                return PropertyInquiry.objects.filter(house__agent=agent)
            except Agent.DoesNotExist:
                logger.error(f"User {user.username} has agent role but no agent profile")
                return PropertyInquiry.objects.none()
        elif user.profile.role == 'admin':
            return PropertyInquiry.objects.all()
        else:
            return PropertyInquiry.objects.none()

    def perform_create(self, serializer):
        """
        Set the tenant field to the current user.
        Ensure only tenants can create inquiries.
        """
        user = self.request.user
        import logging
        logger = logging.getLogger(__name__)

        # Check if user is a tenant
        if not hasattr(user, 'profile') or user.profile.role != 'tenant':
            logger.warning(f"User {user.username} attempted to create an inquiry but is not a tenant")
            raise serializers.ValidationError({
                "detail": "Only tenants can create property inquiries."
            })

        # Save the inquiry with the tenant set to the current user
        serializer.save(tenant=user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAgent])
    def respond(self, request, pk=None):
        """
        Allow an agent to respond to an inquiry.
        Only the agent associated with the property can respond.
        """
        inquiry = self.get_object()
        import logging
        logger = logging.getLogger(__name__)

        # Check if the inquiry is about a property associated with this agent
        try:
            agent = Agent.objects.get(user=request.user)
            if inquiry.house.agent != agent:
                logger.warning(f"Agent {agent.name} attempted to respond to an inquiry about a property not associated with them")
                return Response(
                    {"detail": "You can only respond to inquiries about your own properties."},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Agent.DoesNotExist:
            logger.error(f"User {request.user.username} has agent role but no agent profile")
            return Response(
                {"detail": "You have an agent role but no agent profile. Please contact an administrator."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Update the inquiry with the response
        response = request.data.get('response', '')
        if not response:
            return Response(
                {"detail": "Response cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        inquiry.response = response
        inquiry.status = 'responded'
        inquiry.save()

        serializer = self.get_serializer(inquiry)
        return Response(serializer.data)
