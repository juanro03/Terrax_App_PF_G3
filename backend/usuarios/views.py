from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.conf import settings 
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .models import Usuario
from .serializers import UsuarioSerializer, CustomTokenObtainPairSerializer
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    @action(
        detail=False,
        methods=['delete'],
        url_path=r'delete-by-username/(?P<username>[^/.]+)'
    )
    def delete_by_username(self, request, username=None):
        try:
            usuario = Usuario.objects.get(username=username)
            usuario.delete()
            return Response({"detail": "Usuario eliminado"}, status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response({"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"], url_path="cambiar-password")
    def cambiar_password(self, request, pk=None):
        usuario = self.get_object()
        actual = request.data.get("actual")
        nueva = request.data.get("nueva")

        if not usuario.check_password(actual):
            return Response({"detail": "Contraseña actual incorrecta"}, status=status.HTTP_400_BAD_REQUEST)

        usuario.set_password(nueva)
        usuario.save()
        return Response({"detail": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

User = get_user_model()

@api_view(["POST"])
def enviar_notificacion(request):
    try:
        usuario_id = request.data.get("usuario_id")
        usuario = Usuario.objects.get(pk=usuario_id)

        # ----- cuerpo del correo -----
        context = {"nombre": usuario.first_name or usuario.username}

        text_body = (
            f"Estimado/a {context['nombre']},\n\n"
            "Tiene una suscripción pendiente de pago. "
            "Para regularizarla, por favor contacte a los administradores.\n\n"
            "Saludos,\nEquipo Terrax"
        )
        html_body = render_to_string("correos/deuda.html", context)

        # ----- envío -----
        email = EmailMultiAlternatives(
            subject="Aviso de suscripción pendiente – Terrax",
            body=text_body,                      # versión texto
            from_email="Terrax <no-reply@terrax.com>",
            to=[usuario.email],
        )
        email.attach_alternative(html_body, "text/html")  # versión HTML
        email.send()

        return Response({"mensaje": "Notificación enviada con éxito"}, status=status.HTTP_200_OK)

    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Log rápido en consola
        print("Error al enviar correo:", e)
        return Response({"error": "Error interno"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
def desactivar_usuario(request, pk):
    try:
        usuario = Usuario.objects.get(pk=pk)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    usuario.is_active = False
    usuario.save()
    return Response({"mensaje": "Usuario desactivado correctamente"}, status=status.HTTP_200_OK)


@api_view(["PATCH"])
def activar_usuario(request, pk):
    try:
        user = Usuario.objects.get(pk=pk)
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response({"detail": "Usuario reactivado"})
    except Usuario.DoesNotExist:
        return Response({"detail": "No encontrado"}, status=status.HTTP_404_NOT_FOUND)
class PasswordResetRequestAPIView(APIView):
    """
    Recibe { email }, valida usuario y envía mail con link de reset.
    """
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")

        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            # Nunca revelar si el email existe o no
            return Response(
                {"detail": "Si existe esa cuenta, recibirás un e-mail con instrucciones."},
                status=status.HTTP_200_OK
            )

        # Generar uid + token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Construir link desde settings
        reset_link = f"{settings.FRONTEND_RESET_PASSWORD_URL}?uid={uid}&token={token}"

        # Enviar email
        subject = "Recuperá tu contraseña"
        message = (
            f"Hola {user.get_full_name() or user.username},\n\n"
            f"Hacé clic aquí para restablecer tu contraseña:\n{reset_link}\n\n"
            "Si no solicitaste este cambio, podés ignorar este correo."
        )

        send_mail(subject, message, None, [user.email], fail_silently=False)

        return Response(
            {"detail": "Si existe esa cuenta, recibirás un e-mail con instrucciones."},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmAPIView(APIView):
    """
    Recibe { uid, token, new_password, re_new_password } y actualiza clave.
    """
    permission_classes = []

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        pw1 = request.data.get("new_password")
        pw2 = request.data.get("re_new_password")

        if pw1 != pw2:
            return Response({"detail": "Las contraseñas no coinciden."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = Usuario.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Enlace inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(pw1)
        user.save()
        return Response({"detail": "Contraseña actualizada con éxito."}, status=status.HTTP_200_OK)
    
class UsuarioActualAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
    
