# backend/campos/views.py
from rest_framework import viewsets
from .models import Campo, Servicio     # <-- Servicio aquí debe estar definido en models.py
from .serializers import CampoSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from datetime import date

from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage

class CampoViewSet(viewsets.ModelViewSet):
    queryset = Campo.objects.all()
    serializer_class = CampoSerializer
    permission_classes = [AllowAny]  # cambiar a IsAuthenticated en producción si corresponde

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Campo.objects.all()
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
    # Requiere que el usuario esté autenticado para poder asociar la solicitud.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # datos desde frontend
        campo_id = request.data.get('campo')
        tipo_tarea = request.data.get('tipoTarea')
        fecha_inicio = request.data.get('fechaInicio')
        fecha_fin = request.data.get('fechaFin')
        observaciones = request.data.get('observaciones', "")

        # validación básica de presencia
        if not campo_id or not tipo_tarea or not fecha_inicio or not fecha_fin:
            return Response({"error": "Faltan datos"}, status=status.HTTP_400_BAD_REQUEST)

        # validar existencia de campo y permisos
        try:
            campo = Campo.objects.get(id=campo_id)
            # si no es admin, el campo debe ser del usuario
            if getattr(request.user, "rol", None) != "admin" and campo.propietario != request.user:
                return Response({"error": "No tiene permiso para solicitar servicio en este campo."}, status=status.HTTP_403_FORBIDDEN)
        except Campo.DoesNotExist:
            return Response({"error": "El campo no existe"}, status=status.HTTP_404_NOT_FOUND)

        # validar fechas
        try:
            today = date.today()
            fecha_inicio_obj = date.fromisoformat(fecha_inicio)
            fecha_fin_obj = date.fromisoformat(fecha_fin)
        except ValueError:
            return Response({"error": "Formato de fecha inválido. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if fecha_inicio_obj < today or fecha_fin_obj < today:
            return Response({"error": "Las fechas no pueden ser anteriores a hoy"}, status=status.HTTP_400_BAD_REQUEST)

        if fecha_fin_obj < fecha_inicio_obj:
            return Response({"error": "La fecha fin no puede ser anterior a la fecha inicio"}, status=status.HTTP_400_BAD_REQUEST)

        # Crear registro en la BD (si tenés el modelo Servicio con estos campos)
        try:
            # Ajustá los nombres de campo si tu modelo Servicio tiene otros nombres
            servicio = Servicio.objects.create(
                usuario=request.user,
                campo=campo,
                tipo_tarea=tipo_tarea,
                fecha_inicio=fecha_inicio_obj,
                fecha_fin=fecha_fin_obj,
                observaciones=observaciones
            )
        except Exception:
            servicio = None

        # ===========================
        # EMAIL
        # ===========================

        # destinatario: propietario del campo
        email_destino = "terrax.jj@gmail.com"

        # texto plano
        plain_text = (
            f"Nueva Solicitud de Servicio\n\n"
            f"Usuario: {request.user.get_full_name() or request.user.username} ({request.user.email})\n"
            f"Campo: {campo.nombre}\n"
            f"Tarea: {tipo_tarea}\n"
            f"Fecha inicio: {fecha_inicio}\n"
            f"Fecha fin: {fecha_fin}\n"
            + (f"Observaciones: {observaciones}\n" if observaciones else "")
        )

        # HTML con logo
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 640px; margin: 0 auto; padding: 16px; border-radius: 12px; border: 1px solid #e0e0e0; background: #f9faf9;">

            <div style="text-align: center; margin-bottom: 16px;">
                <img src="cid:logo"
                    style="display: block; margin: 0 auto 8px auto; max-width: 320px; width: 100%; height: auto;"
                    alt="Terrax"/>
            </div>

            <h2 style="color: #155a36; text-align: center; margin-bottom: 8px;">
                Nueva Solicitud de Servicio
            </h2>

            <p><strong>Usuario:</strong> {request.user.get_full_name() or request.user.username} ({request.user.email})</p>
            <p><strong>Campo:</strong> {campo.nombre}</p>
            <p><strong>Tarea solicitada:</strong> {tipo_tarea}</p>
            <p><strong>Fecha de inicio:</strong> {fecha_inicio}</p>
            <p><strong>Fecha de fin:</strong> {fecha_fin}</p>

            {f"<p><strong>Observaciones:</strong> {observaciones}</p>" if observaciones else ""}

            <hr style="margin: 20px 0;" />

            <p style="font-size: 12px; color: #777; text-align: center;">
                Este es un mensaje automático generado por Terrax. Por favor, no respondas a este correo.
            </p>

            </div>
        </body>
        </html>
        """

        # Construcción EmailMultiAlternatives
        msg = EmailMultiAlternatives(
            subject="Nueva solicitud de servicio",
            body=plain_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email_destino],
        )

        msg.attach_alternative(html_content, "text/html")

        # adjuntar logo embebido
        try:
            logo_path = settings.BASE_DIR / "campos" / "static"/ "img" / "logo.png"
            with open(logo_path, "rb") as f:
                logo = MIMEImage(f.read())
            logo.add_header("Content-ID", "<logo>")
            logo.add_header("Content-Disposition", "inline", filename="logo.png")
            msg.attach(logo)
        except FileNotFoundError:
            pass

        try:
            msg.send(fail_silently=False)
        except Exception as e:
            return Response({"error": "Error al enviar correo", "detail": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"mensaje": "Solicitud enviada con éxito"}, status=status.HTTP_200_OK)