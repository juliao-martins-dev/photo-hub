from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import Photo
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    PhotoSerializer,
    PhotoUploadSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.GenericViewSet):
    """
    GenericViewSet gives us the base without auto-creating
    list/retrieve/update routes we don't want to expose.
    We only add the exact actions we need using @action.
    """
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        return UserSerializer

    @action(
        detail=False,           # POST /api/users/register/  (no pk in URL)
        methods=['post'],
        permission_classes=[permissions.AllowAny]
    )
    def register(self, request):
        serializer = RegisterSerializer(
            data=request.data,
            context={'request': request}   # needed for HyperlinkedModelSerializer
        )
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user':   UserSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access':  str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,           # GET /api/users/me/
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def me(self, request):
        serializer = UserSerializer(
            request.user,
            context={'request': request}
        )
        return Response(serializer.data)

    # detail=True means /api/users/<pk>/  — needed for HyperlinkedModelSerializer
    # to resolve the 'user-detail' view_name
    def retrieve(self, request, pk=None):
        user = self.get_object()
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)


class PhotoViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet auto-provides:
      GET    /api/photos/          → list()
      POST   /api/photos/          → create()
      GET    /api/photos/<pk>/     → retrieve()
      PUT    /api/photos/<pk>/     → update()
      PATCH  /api/photos/<pk>/     → partial_update()
      DELETE /api/photos/<pk>/     → destroy()

    We override get_queryset to only show the user's own photos,
    and get_serializer_class to use the right serializer per action.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def get_queryset(self):
        # Each user only sees their own photos
        return Photo.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        # Use upload serializer for create, full serializer for everything else
        if self.action == 'create':
            return PhotoUploadSerializer
        return PhotoSerializer

    def perform_create(self, serializer):
        # Automatically attach the logged-in user on upload
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        # Delete the actual file from disk before removing DB record
        instance.image.delete(save=False)
        instance.delete()