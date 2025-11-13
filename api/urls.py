from django.urls import path
from .views import (
    HelloView,
    RegisterView,
    LoginView,
    ProfileView,
    ListingListCreateView,
    ListingRetrieveUpdateDestroyView,
    CategoriesView,
    ConditionsView,
)

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("listings/", ListingListCreateView.as_view(), name="listings-list-create"),
    path("listings/<int:pk>/", ListingRetrieveUpdateDestroyView.as_view(), name="listings-rud"),
    path("meta/categories/", CategoriesView.as_view(), name="meta-categories"),
    path("meta/conditions/", ConditionsView.as_view(), name="meta-conditions"),
]
