from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import LoginAttempt, User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


def get_client_ip(request) -> str | None:
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": "Credenciales inválidas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"].lower()
        password = serializer.validated_data["password"]
        ip = get_client_ip(request)

        # ── Brute-force protection ─────────────────────────────────────────────
        if LoginAttempt.is_locked(email):
            remaining = LoginAttempt.lockout_remaining_seconds(email)
            minutes = remaining // 60
            seconds = remaining % 60
            return Response(
                {
                    "detail": f"Cuenta bloqueada por demasiados intentos fallidos. Intenta de nuevo en {minutes}m {seconds}s.",
                    "locked": True,
                    "remaining_seconds": remaining,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        # ── Authenticate ───────────────────────────────────────────────────────
        user = authenticate(request, username=email, password=password)

        if user is None:
            LoginAttempt.record(email=email, ip_address=ip, succeeded=False)
            return Response(
                {"detail": "Credenciales inválidas.", "locked": False},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # ── Success ────────────────────────────────────────────────────────────
        LoginAttempt.record(email=email, ip_address=ip, succeeded=True)
        LoginAttempt.clear_failed(email)

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
