from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from realestate.views import (
    HouseViewSet, PropertyTypeViewSet, FeatureViewSet, PropertyImageViewSet, AgentViewSet, FavoriteViewSet, 
    UserProfileViewSet, RegisterView, UserMeView, PropertyInquiryViewSet,
    TenantTokenObtainPairView, AgentTokenObtainPairView, AutoDetectRoleTokenObtainPairView
)

router = routers.DefaultRouter()
router.register(r'properties/listings', HouseViewSet, basename='property')
router.register(r'properties/types', PropertyTypeViewSet, basename='propertytype')
router.register(r'properties/features', FeatureViewSet, basename='feature')
router.register(r'properties/images', PropertyImageViewSet, basename='propertyimage')
router.register(r'properties/agents', AgentViewSet, basename='agent')
router.register(r'properties/favorites', FavoriteViewSet, basename='favorite')
router.register(r'properties/inquiries', PropertyInquiryViewSet, basename='propertyinquiry')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # General token endpoint with automatic role detection
    path('api/users/token/', AutoDetectRoleTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Role-specific login endpoints
    path('api/users/tenant/login/', TenantTokenObtainPairView.as_view(), name='tenant-login'),
    path('api/users/agent/login/', AgentTokenObtainPairView.as_view(), name='agent-login'),
    # User management endpoints
    path('api/users/register/', RegisterView.as_view(), name='user-register'),
    path('api/users/me/', UserMeView.as_view(), name='user-me'),
    path('api/users/update_profile/', UserProfileViewSet.as_view({'put': 'update'}), name='user-update-profile'),
]
