from django.db import models
from django.contrib.auth.hashers import make_password, check_password as django_check_password

# Reusable choices
CATEGORY_CHOICES = [
    ("cars", "Автомобили"),
    ("realty", "Недвижимость"),
]

CONDITION_CHOICES = [
    ("new", "Новое"),
    ("used", "Б/У"),
]


class Member(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=254, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=32, null=True, blank=True)
    password = models.CharField(max_length=128)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def set_password(self, raw_password: str) -> None:
        self.password = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return django_check_password(raw_password, self.password)

    def __str__(self) -> str:
        return self.username


class Listing(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES)
    contact_phone = models.CharField(max_length=32)
    contact_email = models.EmailField()
    author = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="listings")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"{self.title} ({self.author.username})"
