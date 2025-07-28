from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Lote
from .serializers import LoteSerializer
from .models import Siembra
from .serializers import SiembraSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import CreateAPIView
from .models import Cosecha
from .serializers import CosechaSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Campania
from .serializers import CampaniaSerializer
from .serializers import CoberturaSerializer
from .models import Cobertura


class LoteViewSet(viewsets.ModelViewSet):
    """
    API REST para gestionar lotes agrícolas.
    """
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer
    permission_classes = [AllowAny]  #permiso abierto para pruebas (IsAuthenticated para pedir autenticacion)
    
    @action(detail=False, methods=['get'], url_path='por-campo/(?P<campo_id>[^/.]+)')
    def obtener_lotes_por_campo(self, request, campo_id=None):
        """
        Devuelve todos los lotes que pertenecen a un campo específico.
        Endpoint: /api/lotes/por-campo/<campo_id>/
        """
        lotes = Lote.objects.filter(campo_id=campo_id)
        serializer = self.get_serializer(lotes, many=True)
        return Response(serializer.data)
    
class SiembraViewSet(viewsets.ModelViewSet):
    queryset = Siembra.objects.all()
    serializer_class = SiembraSerializer

    @action(detail=False, methods=['get'], url_path='por-lote/(?P<lote_id>[^/.]+)')
    def obtener_por_lote(self, request, lote_id=None):
        try:
            siembra = Siembra.objects.get(lote__id=lote_id)
            serializer = self.get_serializer(siembra)
            return Response(serializer.data)
        except Siembra.DoesNotExist:
            return Response({"error": "No hay siembra registrada aún."}, status=status.HTTP_404_NOT_FOUND)
        
class CosechaCreateView(CreateAPIView):
    queryset = Cosecha.objects.all()
    serializer_class = CosechaSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        print("DATA:", request.data)
        print("FILES:", request.FILES)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("ERRORES DEL SERIALIZER:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class FinalizarCampaniaView(APIView):
    def post(self, request, lote_id):
        try:
            # Obtener la siembra asociada
            siembra = Siembra.objects.get(lote_id=lote_id)

            # Obtener la última cosecha asociada
            cosecha = Cosecha.objects.filter(lote_id=lote_id).order_by('-fecha').first()

            if not cosecha:
                return Response({"error": "No se encontró una cosecha asociada al lote."}, status=404)

            # Crear el historial con los datos de siembra + cosecha
            historial = Campania.objects.create(
                lote=siembra.lote,
                fecha_siembra=siembra.fecha,
                cultivo=siembra.cultivo,
                variedad=siembra.variedad,
                densidad=siembra.densidad,
                unidad_densidad=siembra.unidad_densidad,
                ventana_cosecha=siembra.ventana_cosecha,
                analisis_suelo=siembra.analisis_suelo,

                fecha_cosecha=cosecha.fecha,
                rinde=cosecha.rinde,
                archivo_rendimiento=cosecha.archivo_rendimiento,
            )

            # Eliminar la siembra actual
            siembra.delete()

            return Response({"mensaje": "Campaña finalizada y registrada en historial."}, status=200)

        except Siembra.DoesNotExist:
            return Response({"error": "No se encontró una siembra asociada al lote."}, status=404)
class HistorialPorLoteView(APIView):
    def get(self, request, lote_id):
        historial = Campania.objects.filter(lote_id=lote_id).order_by('-fecha_siembra')
        serializer = CampaniaSerializer(historial, many=True)
        return Response(serializer.data)

class CoberturaViewSet(viewsets.ModelViewSet):
    queryset = Cobertura.objects.all()
    serializer_class = CoberturaSerializer

    @action(detail=False, methods=["get"], url_path='por-lote/(?P<lote_id>[^/.]+)')
    def por_lote(self, request, lote_id=None):
        try:
            cobertura = Cobertura.objects.get(lote_id=lote_id)
            serializer = self.get_serializer(cobertura)
            return Response(serializer.data)
        except Cobertura.DoesNotExist:
            return Response({"error": "No hay cobertura registrada."}, status=status.HTTP_404_NOT_FOUND)