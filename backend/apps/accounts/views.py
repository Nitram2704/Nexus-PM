from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, OutstandingToken, BlacklistedToken

from .models import LoginAttempt, User
from .serializers import (
    LoginSerializer, 
    RegisterSerializer, 
    UserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)


def get_client_ip(request) -> str | None:
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class RegisterView(APIView):
    # ... (keeping existing RegisterView)
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
    # ... (keeping existing LoginView)
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


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        
        try:
            user = User.objects.get(email=email)
            # Generar token y uid
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # En v1 usamos localhost:5173 para el frontend
            reset_url = f"http://localhost:5173/reset-password/{uid}/{token}/"
            
            # Enviar correo (simulado en consola)
            send_mail(
                subject="Restablecer contraseña - Nexus PM",
                message=f"Haz clic en el siguiente enlace para restablecer tu contraseña: {reset_url}\n\nEste enlace expirará en 30 minutos.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            # Por seguridad, no revelamos si el usuario existe o no
            pass
            
        return Response(
            {"detail": "Si el correo existe en nuestro sistema, recibirás un enlace de restablecimiento."},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Enlace inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Enlace inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Actualizar contraseña
        user.set_password(serializer.validated_data["password"])
        user.save()
        
        # INVALIDAR SESIONES ACTIVAS (Blacklisting)
        # Buscamos todos los tokens pendientes de este usuario y los metemos en la lista negra
        tokens = OutstandingToken.objects.filter(user=user)
        for t in tokens:
            BlacklistedToken.objects.get_or_create(token=t)
            
        return Response({"detail": "Contraseña restablecida con éxito."}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
