from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer, CustomTokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView

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


# Vista personalizada para login con email
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    