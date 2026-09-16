from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserProfileSerializer

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            # Initialize default user quests
            from expenses.gamification import initialize_user_gamification
            initialize_user_gamification(user)

            user_data = UserProfileSerializer(user).data
            return Response({
                'message': 'Account registered successfully! Welcome to Track My Spend.',
                'user': user_data,
                'tokens': tokens,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Please provide both email and password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = get_tokens_for_user(user)
        user_data = UserProfileSerializer(user).data

        return Response({
            'message': 'Login successful.',
            'user': user_data,
            'tokens': tokens,
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        full_name = request.data.get('full_name', '').strip()
        if not full_name:
            return Response({'full_name': 'Full name cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.full_name = full_name
        request.user.save()
        serializer = UserProfileSerializer(request.user)
        return Response({
            'message': 'Profile updated successfully.',
            'user': serializer.data
        }, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        top_users = User.objects.order_by('-xp')[:10]
        data = []
        for rank_idx, u in enumerate(top_users, start=1):
            data.append({
                'rank': rank_idx,
                'full_name': u.full_name,
                'level': u.level,
                'rank_title': u.rank_title,
                'xp': u.xp,
                'streak_days': u.streak_days,
                'is_current_user': u.id == request.user.id
            })
        return Response(data, status=status.HTTP_200_OK)
