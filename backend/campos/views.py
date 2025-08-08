from rest_framework import viewsets
from .models import Campo
from .serializers import CampoSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status



class CampoViewSet(viewsets.ModelViewSet):
    queryset = Campo.objects.all()
    serializer_class = CampoSerializer
    permission_classes = [AllowAny]  #permiso abierto para pruebas (IsAuthenticated para pedir autenticacion)

    def get_queryset(self):
        user = self.request.user
        # Si no está autenticado, devolver todos para pruebas
        if not user.is_authenticated:
            return Campo.objects.all()

        # Si está autenticado y es admin
        if hasattr(user, 'rol') and user.rol == 'admin':
            return Campo.objects.all()

        return Campo.objects.filter(propietario=user)

    def perform_create(self, serializer):
        serializer.save(propietario=self.request.user)

    def update(self, request, *args, **kwargs):
        campo = self.get_object()
        if request.user.rol == 'productor' and campo.propietario != request.user:
            return Response({"detail": "No tiene permiso para editar este campo."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        campo = self.get_object()
        if request.user.rol == 'productor' and campo.propietario != request.user:
            return Response({"detail": "No tiene permiso para eliminar este campo."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
class SolicitarServicioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tipo_tarea = request.data.get('tipo_tarea')
        fecha_inicio = request.data.get('fech_tnicio')
        fecha_fin = request.data.get('fecha_fin')

        if not tipo_tarea or not fecha_inicio or not fecha_fin:
            return Response({"error": "Faltan datos"}, status=status.HTTP_400_BAD_REQUEST)

        # Enviar correo
        send_mail(
            subject="Nueva solicitud de servicio",
            message=f"Tarea: {tipo_tarea}\nFecha inicio: {fecha_inicio}\nFecha fin: {fecha_fin}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['admin@terrax.com'],  # Cambiar por el correo real
            fail_silently=False
        )

        return Response({"mensaje": "Solicitud enviada con éxito"}, status=status.HTTP_200_OK)