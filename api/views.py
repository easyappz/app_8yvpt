from django.utils import timezone
from django.conf import settings
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from decimal import Decimal, InvalidOperation
from datetime import date as date_cls

from .serializers import (
    MessageSerializer,
    MemberPublicSerializer,
    MemberRegisterSerializer,
    MemberUpdateSerializer,
    ListingSerializer,
)
from .models import Member, Listing
from .authentication import JWTAuthentication
from .permissions import IsAuthenticatedMember, IsOwnerOrReadOnly
from .utils import create_jwt


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    @extend_schema(
        request=MemberRegisterSerializer,
        responses={201: MemberPublicSerializer},
        description="Register a new member",
    )
    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = serializer.save()
        data = MemberPublicSerializer(member).data
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "username": {"type": "string"},
                    "password": {"type": "string"},
                },
                "required": ["username", "password"],
            }
        },
        responses={200: {"type": "object"}},
        description="Authenticate member and return JWT",
    )
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        if not username or not password:
            return Response(
                {"detail": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST
            )

        if not member.check_password(password):
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST
            )

        token = create_jwt(
            member_id=member.id,
            username=member.username,
            exp=getattr(settings, "APP_JWT_EXPIRES_SECONDS", 86400),
        )
        data = {
            "access": token,
            "token_type": "bearer",
            "member": MemberPublicSerializer(member).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedMember]

    @extend_schema(
        responses={200: MemberPublicSerializer},
        description="Get current member profile",
    )
    def get(self, request):
        member: Member = request.user
        return Response(MemberPublicSerializer(member).data)

    @extend_schema(
        request=MemberUpdateSerializer,
        responses={200: MemberPublicSerializer},
        description="Update current member profile (PUT)",
    )
    def put(self, request):
        member: Member = request.user
        serializer = MemberUpdateSerializer(instance=member, data=request.data, partial=False)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = serializer.save()
        return Response(MemberPublicSerializer(member).data)

    @extend_schema(
        request=MemberUpdateSerializer,
        responses={200: MemberPublicSerializer},
        description="Update current member profile (PATCH)",
    )
    def patch(self, request):
        member: Member = request.user
        serializer = MemberUpdateSerializer(instance=member, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = serializer.save()
        return Response(MemberPublicSerializer(member).data)


class ListingListCreateView(ListCreateAPIView):
    serializer_class = ListingSerializer
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAuthenticatedMember()]

    def get_queryset(self):
        qs = Listing.objects.filter(is_active=True)
        params = self.request.query_params

        category = params.get("category")
        if category in {"cars", "realty"}:
            qs = qs.filter(category=category)

        condition = params.get("condition")
        if condition in {"new", "used"}:
            qs = qs.filter(condition=condition)

        min_price = params.get("min_price")
        if min_price is not None and min_price != "":
            try:
                qs = qs.filter(price__gte=Decimal(min_price))
            except (InvalidOperation, ValueError):
                pass

        max_price = params.get("max_price")
        if max_price is not None and max_price != "":
            try:
                qs = qs.filter(price__lte=Decimal(max_price))
            except (InvalidOperation, ValueError):
                pass

        date_from = params.get("date_from")
        if date_from:
            try:
                d = date_cls.fromisoformat(date_from)
                qs = qs.filter(created_at__date__gte=d)
            except ValueError:
                pass

        date_to = params.get("date_to")
        if date_to:
            try:
                d = date_cls.fromisoformat(date_to)
                qs = qs.filter(created_at__date__lte=d)
            except ValueError:
                pass

        q = params.get("q")
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))

        ordering = params.get("ordering")
        if ordering in ("-created_at", "created_at"):
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by("-created_at")

        return qs


class ListingRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwnerOrReadOnly]


class CategoriesView(APIView):
    @extend_schema(
        responses={200: {"type": "array", "items": {"type": "object"}}},
        description="List available categories",
    )
    def get(self, request):
        data = [
            {"key": "cars", "label": "Автомобили"},
            {"key": "realty", "label": "Недвижимость"},
        ]
        return Response(data, status=status.HTTP_200_OK)


class ConditionsView(APIView):
    @extend_schema(
        responses={200: {"type": "array", "items": {"type": "object"}}},
        description="List available item conditions",
    )
    def get(self, request):
        data = [
            {"key": "new", "label": "Новое"},
            {"key": "used", "label": "Б/у"},
        ]
        return Response(data, status=status.HTTP_200_OK)
