from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny

from tareas.models import Tarea
from .serializers import TareaSerializer


class TareaViewSet(viewsets.ModelViewSet):
    serializer_class = TareaSerializer
    parser_classes = [MultiPartParser, FormParser]
    "permission_classes = [IsAuthenticated]"

    def get_queryset(self):
        user = self.request.user

        # Base: tareas + relaciones para evitar N+1
        qs = Tarea.objects.select_related("lote", "lote__campo")

        # 🔒 Si NO es admin, solo tareas de campos de ese productor
        if getattr(user, "rol", None) != "admin":
            qs = qs.filter(lote__campo__propietario=user)

        # Filtros opcionales por query params (lo que manda el calendario)
        campo_id = self.request.query_params.get("campo")
        lote_id = self.request.query_params.get("lote")
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")

        # 🧪 Si campo / lote vienen vacíos (Todos en el frontend), NO se filtra por ellos
        if campo_id:
            qs = qs.filter(lote__campo_id=campo_id)
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        if start:
            qs = qs.filter(fecha__gte=start)
        if end:
            qs = qs.filter(fecha__lt=end)

        return qs.order_by("fecha", "id")
