from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from django.urls import path
from .views import UserViewSet, PhotoViewSet

# Router auto-generates all URLs from the ViewSets
router = DefaultRouter()
router.register(r'users',  UserViewSet,  basename='user')
router.register(r'photos', PhotoViewSet, basename='photo')


urlpatterns = [
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(),   name='token_refresh'),
    path('users/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
] + router.urls