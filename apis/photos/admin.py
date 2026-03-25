from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Photo


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering         = ['email']
    list_display     = ['email', 'username', 'is_staff', 'created_at']
    fieldsets        = (
        (None,           {'fields': ('email', 'password')}),
        ('Personal',     {'fields': ('username',)}),
        ('Permissions',  {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets    = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    search_fields    = ['email', 'username']
    filter_horizontal = ()


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display  = ['user', 'caption', 'uploaded_at']
    list_filter   = ['uploaded_at']
    search_fields = ['user__email', 'caption']