from rest_framework import serializers
from .models import User, Photo


class UserSerializer(serializers.HyperlinkedModelSerializer):
    """
    HyperlinkedModelSerializer uses URLs as the identity
    of each object instead of plain integer IDs.
    e.g. "url": "http://localhost:8000/api/users/1/"
    """
    class Meta:
        model  = User
        fields = ['url', 'id', 'username', 'email', 'created_at']
        # 'url' field auto-generated — points to UserViewSet detail endpoint
        extra_kwargs = {
            'url': {'view_name': 'user-detail'}
        }


class RegisterSerializer(serializers.HyperlinkedModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['url', 'id', 'username', 'email', 'password']
        extra_kwargs = {
            'url':      {'view_name': 'user-detail'},
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )


class PhotoSerializer(serializers.HyperlinkedModelSerializer):
    """
    'url' points to the photo detail endpoint.
    'user' points to the owner's user detail endpoint.
    'image_url' builds the full absolute URL for the image file.
    """
    image_url = serializers.SerializerMethodField()

    # Shows the user as a hyperlink instead of just an ID
    user = serializers.HyperlinkedRelatedField(
        view_name='user-detail',
        read_only=True
    )

    class Meta:
        model  = Photo
        fields = ['url', 'id', 'user', 'image', 'image_url', 'caption', 'uploaded_at']
        extra_kwargs = {
            'url':   {'view_name': 'photo-detail'},
            'image': {'write_only': True},
        }

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class PhotoUploadSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model  = Photo
        fields = ['url', 'id', 'image', 'caption']
        extra_kwargs = {
            'url': {'view_name': 'photo-detail'},
        }