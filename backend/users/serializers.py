from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'password', 'confirm_password')
        extra_kwargs = {
            'full_name': {'required': True},
            'email': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        # Give 20 initial welcome XP
        user.add_xp(20)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    tier_info = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'full_name',
            'xp',
            'level',
            'rank_title',
            'streak_days',
            'last_expense_date',
            'created_at',
            'tier_info',
        )
        read_only_fields = ('id', 'email', 'xp', 'level', 'rank_title', 'streak_days', 'last_expense_date', 'created_at')

    def get_tier_info(self, obj):
        return obj.current_tier_info
