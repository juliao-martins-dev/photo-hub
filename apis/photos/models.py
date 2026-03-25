from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


# ─── User Manager ────────────────────────────────────────────────────────────

class UserManager(BaseUserManager):
    """
    Tells Django HOW to create users.
    We override it because our login field is email, not username.
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)       
        user = self.model(email=email, **extra_fields)
        user.set_password(password)               
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


# ─── Custom User Model ────────────────────────────────────────────────────────

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model.
    Login uses EMAIL instead of username.
    """
    email      = models.EmailField(unique=True)
    username   = models.CharField(max_length=50)
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'      
    REQUIRED_FIELDS = ['username'] 

    def __str__(self):
        return self.email


# ─── Photo Model ──────────────────────────────────────────────────────────────

def photo_upload_path(instance, filename):
    """
    Saves each user's photos in their own folder:
    media/photos/user_<id>/<filename>
    """
    return f'photos/user_{instance.user.id}/{filename}'


class Photo(models.Model):
    user       = models.ForeignKey(
                    User,
                    on_delete=models.CASCADE,  
                    related_name='photos'
                )
    image      = models.ImageField(upload_to=photo_upload_path)
    caption    = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']  

    def __str__(self):
        return f'Photo by {self.user.email} at {self.uploaded_at}'