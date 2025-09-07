from rest_framework import viewsets
from .models import Campo
from .serializers import CampoSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from datetime import date
from .serializers import CampoSerializer



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
    

class MisCamposView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        campos = Campo.objects.filter(propietario=request.user)
        serializer = CampoSerializer(campos, many=True)
        return Response(serializer.data)
class SolicitarServicioView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        campo_id = request.data.get('campo')
        tipo_tarea = request.data.get('tipoTarea')
        fecha_inicio = request.data.get('fechaInicio')
        fecha_fin = request.data.get('fechaFin')
        observaciones = request.data.get('observaciones', "")

        if not campo_id or not tipo_tarea or not fecha_inicio or not fecha_fin:
            return Response({"error": "Faltan datos"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar campo
        try:
            campo = Campo.objects.get(id=campo_id)
            # Si el usuario está logueado y no es admin, validar que el campo sea suyo
            if request.user.is_authenticated and getattr(request.user, "rol", None) != "admin":
                if campo.propietario != request.user:
                    return Response({"error": "No tiene permiso para solicitar servicio en este campo."}, status=status.HTTP_403_FORBIDDEN)
        except Campo.DoesNotExist:
            return Response({"error": "El campo no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Validar fechas
        today = date.today()
        fecha_inicio_obj = date.fromisoformat(fecha_inicio)
        fecha_fin_obj = date.fromisoformat(fecha_fin)

        if fecha_inicio_obj < today or fecha_fin_obj < today:
            return Response({"error": "Las fechas no pueden ser anteriores a hoy"}, status=status.HTTP_400_BAD_REQUEST)

        if fecha_fin_obj < fecha_inicio_obj:
            return Response({"error": "La fecha fin no puede ser anterior a la fecha inicio"}, status=status.HTTP_400_BAD_REQUEST)

        # Formato HTML para el correo
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4CAF50;">Nueva Solicitud de Servicio</h2>
            <p><strong>Campo:</strong> {campo.nombre}</p>
            <p><strong>Tarea:</strong> {tipo_tarea}</p>
            <p><strong>Fecha de inicio:</strong> {fecha_inicio}</p>
            <p><strong>Fecha de fin:</strong> {fecha_fin}</p>
            {"<p><strong>Observaciones:</strong> " + observaciones + "</p>" if observaciones else ""}
            <hr>
            <p style="font-size: 12px; color: #777;">Este es un mensaje automático, no responder.</p>
        </body>
        </html>
        """
# Texto plano (backup en caso que no soporte HTML)
        plain_message = (
            f"Campo: {campo.nombre}\n"
            f"Tarea: {tipo_tarea}\n"
            f"Fecha inicio: {fecha_inicio}\n"
            f"Fecha fin: {fecha_fin}\n"
        )
        if observaciones:
            plain_message += f"Observaciones: {observaciones}\n"

        send_mail(
            subject="Nueva solicitud de servicio",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['mati992008@gmail.com'],
            fail_silently=False,
            html_message=html_content
        )

        return Response({"mensaje": "Solicitud enviada con éxito"}, status=status.HTTP_200_OK)