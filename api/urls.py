from django.urls import path
from .views import HelloView, RegisterView, LoginView, ProfileView

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("profile/", ProfileView.as_view(), name="profile"),
]
