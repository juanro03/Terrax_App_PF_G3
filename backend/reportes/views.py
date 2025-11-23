# reportes/views.py
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Reporte, Anotacion
from .serializers import ReporteSerializer, AnotacionSerializer

from lotes.models import Lote  # para validaciones / filtros

class ReporteViewSet(viewsets.ModelViewSet):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'admin':
            qs = Reporte.objects.all()
        else:
            qs = Reporte.objects.filter(productor=user)

        campo_id = self.request.query_params.get('campo')
        lote_id = self.request.query_params.get('lote')
        if campo_id:
            qs = qs.filter(campo_id=campo_id)
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.rol != 'admin':
            raise ValidationError("Solo los administradores pueden crear reportes.")

        campo = serializer.validated_data['campo']
        lote = serializer.validated_data['lote']
        productor = serializer.validated_data['productor']

        if campo.propietario != productor:
            raise ValidationError("El campo no pertenece al productor indicado.")
        if lote.campo != campo:
            raise ValidationError("El lote no pertenece al campo indicado.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if user.rol != 'admin':
            raise ValidationError("Solo los administradores pueden eliminar reportes.")
        return super().destroy(request, *args, **kwargs)


# ====== NUEVO: Anotaciones por LOTE ======
class LoteAnotacionViewSet(viewsets.ModelViewSet):
    """
    /api/lotes/<lote_pk>/anotaciones/
    """
    serializer_class = AnotacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Base: solo anotaciones creadas por este usuario
        qs = Anotacion.objects.select_related("lote", "lote__campo")
        if getattr(user, "rol", None) != "admin":
            qs = qs.filter(creado_por=user)

        # Filtro opcional por lote (cuando el endpoint es /lotes/<id>/anotaciones/)
        lote_pk = self.kwargs.get("lote_pk") or self.request.query_params.get("lote")
        if lote_pk:
            qs = qs.filter(lote_id=lote_pk)

        return qs.order_by("creado_en")

    """
    /api/lotes/<lote_pk>/anotaciones/
    """
    serializer_class = AnotacionSerializer
    "permission_classes = [IsAuthenticated]"

    def get_queryset(self):
        qs = Anotacion.objects.all()
        lote_pk = self.kwargs.get("lote_pk") or self.request.query_params.get("lote")
        if lote_pk:
            qs = qs.filter(lote_id=lote_pk)
        return qs

    def perform_create(self, serializer):
        lote_pk = self.kwargs.get("lote_pk") or self.request.data.get("lote")
        if not lote_pk:
            raise ValidationError("Debe indicar el lote.")
        try:
            Lote.objects.get(pk=lote_pk)
        except Lote.DoesNotExist:
            raise ValidationError("Lote inválido.")

        serializer.save(
            lote_id=lote_pk,
            creado_por=self.request.user
        )


# ====== COMPATIBILIDAD: /reportes/<id>/anotaciones/ ======
# (redirige a las anotaciones del LOTE de ese reporte)
class ReporteAnotacionProxyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Mantiene la ruta vieja solo para lectura:
    /api/reportes/<reporte_pk>/anotaciones/
    """
    serializer_class = AnotacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        rep_id = self.kwargs.get("reporte_pk")
        if not rep_id:
            return Anotacion.objects.none()
        try:
            reporte = Reporte.objects.select_related("lote").get(pk=rep_id)
        except Reporte.DoesNotExist:
            return Anotacion.objects.none()
        return Anotacion.objects.filter(lote_id=reporte.lote_id)
