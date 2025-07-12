from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Lote
from .serializers import LoteSerializer

class LoteViewSet(viewsets.ModelViewSet):
    """
    API REST para gestionar lotes agrícolas.
    """
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer
    permission_classes = [AllowAny]  # Permisos abiertos para desarrollo / pruebas

    @action(detail=False, methods=['get'], url_path='por-campo/(?P<campo_id>[^/.]+)')
    def obtener_lotes_por_campo(self, request, campo_id=None):
        """
        Devuelve todos los lotes que pertenecen a un campo específico.
        Endpoint: /api/lotes/por-campo/<campo_id>/
        """
        lotes = Lote.objects.filter(campo_id=campo_id)
        serializer = self.get_serializer(lotes, many=True)
        return Response(serializer.data)
