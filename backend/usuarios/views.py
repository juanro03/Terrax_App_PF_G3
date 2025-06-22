from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer, CustomTokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


    @action(detail=False, methods=['delete'], url_path='delete-by-username/(?P<username>[^/.]+)')
    def delete_by_username(self, request, username=None):
        try:
            usuario = Usuario.objects.get(username=username)  # Nombre de modelo correcto
            usuario.delete()
            return Response({"detail": "Usuario eliminado"}, status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:  # Nombre de modelo correcto
            return Response({"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"], url_path="cambiar-password")
    def cambiar_password(self, request, pk=None):
        usuario = self.get_object()
        nueva = request.data.get("nueva")

        usuario.set_password(nueva)
        usuario.save()
        return Response({"detail": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)

# Vista personalizada para login con email
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

User = get_user_model()

@api_view(['POST'])
def enviar_notificacion(request):
    try:
        user_id = request.data.get("user_id")
        user = User.objects.get(id=user_id)

        send_mail(
            subject="Aviso de deuda pendiente",
            message="Estimado, nos ponemos en contacto con usted desde Terrax para informarle que tiene una deuda pendiente. Ponerse en contacto con los administradores. Muchas gracias. Saludos",
            from_email="noreply@terrax.com",  # o el que esté en tus settings
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({"mensaje": "Notificación enviada con éxito"}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error al enviar notificación:", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)