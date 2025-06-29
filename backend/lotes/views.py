from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import AllowAny   # <-- agregalo
from .models import Lote
from .serializers import LoteSerializer
from .models import Siembra
from .serializers import SiembraSerializer

class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer
    permission_classes = [AllowAny]  # <-- permiso abierto para pruebas
    
    @action(detail=False, methods=['get'], url_path='por-campo/(?P<campo_id>[^/.]+)')
    def obtener_lotes_por_campo(self, request, campo_id=None):
        lotes = Lote.objects.filter(campo_id=campo_id)
        serializer = self.get_serializer(lotes, many=True)
        return Response(serializer.data)
    
class SiembraViewSet(viewsets.ModelViewSet):
    queryset = Siembra.objects.all()
    serializer_class = SiembraSerializer
    