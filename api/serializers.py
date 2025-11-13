from rest_framework import serializers
from .models import Member, Listing


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


class MemberRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "username",
            "email",
            "phone",
            "password",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": True},
            "email": {"required": False, "allow_null": True, "allow_blank": True},
            "phone": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_username(self, value: str) -> str:
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate_email(self, value: str | None) -> str | None:
        if value:
            if Member.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email is already in use.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        member = Member(**validated_data)
        member.set_password(password)
        member.save()
        return member


class MemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "email",
            "phone",
            "password",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
            "email": {"required": False, "allow_null": True, "allow_blank": True},
            "phone": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_email(self, value: str | None) -> str | None:
        if not value:
            return value
        member: Member = self.instance
        if Member.objects.filter(email=value).exclude(pk=member.pk).exists():
            raise serializers.ValidationError("Email is already in use by another member.")
        return value

    def update(self, instance: Member, validated_data):
        password = validated_data.pop("password", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ListingSerializer(serializers.ModelSerializer):
    author = MemberPublicSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "price",
            "category",
            "condition",
            "contact_phone",
            "contact_email",
            "author",
            "author_id",
            "created_at",
            "updated_at",
            "is_active",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]

    def create(self, validated_data):
        # Ignore any incoming author/author_id
        validated_data.pop("author_id", None)
        validated_data.pop("author", None)

        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not isinstance(user, Member):
            raise serializers.ValidationError({"detail": "Authentication required."})

        validated_data["author"] = user
        return super().create(validated_data)

    def update(self, instance: Listing, validated_data):
        # Prevent author change
        incoming_author_id = validated_data.pop("author_id", None)
        if incoming_author_id is not None and incoming_author_id != instance.author_id:
            raise serializers.ValidationError({"author_id": "Author cannot be changed."})
        validated_data.pop("author", None)
        return super().update(instance, validated_data)
