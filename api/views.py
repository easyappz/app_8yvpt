from django.utils import timezone
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from .serializers import (
    MessageSerializer,
    MemberPublicSerializer,
    MemberRegisterSerializer,
    MemberUpdateSerializer,
)
from .models import Member
from .authentication import JWTAuthentication
from .permissions import IsAuthenticatedMember
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
