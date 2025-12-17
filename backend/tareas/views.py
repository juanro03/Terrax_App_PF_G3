from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated

from tareas.models import Tarea
from .serializers import TareaSerializer


class TareaViewSet(viewsets.ModelViewSet):
    serializer_class = TareaSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]  # ✅ ahora sí

    def get_queryset(self):
        user = self.request.user

        # Base: tareas + relaciones (evita N+1)
        qs = Tarea.objects.select_related("lote", "lote__campo")

        # 👑 ADMIN → todas las tareas
        if user.rol != "admin":
            qs = qs.filter(lote__campo__propietario=user)

        # 🎯 Filtros opcionales (dashboard / calendario)
        campo_id = self.request.query_params.get("campo")
        lote_id = self.request.query_params.get("lote")
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")

        if campo_id:
            qs = qs.filter(lote__campo_id=campo_id)
        if lote_id:
            qs = qs.filter(lote_id=lote_id)
        if start:
            qs = qs.filter(fecha__gte=start)
        if end:
            qs = qs.filter(fecha__lte=end)

        return qs.order_by("fecha", "id")
