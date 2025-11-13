from django.contrib import admin

from .models import Member, Listing


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "phone", "is_active", "date_joined")
    search_fields = ("username", "email", "phone")
    list_filter = ("is_active",)
    ordering = ("-date_joined",)


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "category",
        "condition",
        "price",
        "author",
        "is_active",
        "created_at",
    )
    search_fields = ("title", "description", "contact_phone", "contact_email")
    list_filter = ("category", "condition", "is_active")
    ordering = ("-created_at",)
