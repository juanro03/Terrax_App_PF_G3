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
from django.utils.dateparse import parse_date
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.apps import apps
from tareas.models import Tarea

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
        
def _get_model(app_label, model_name):
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None

def _first_attr(obj, names):
    """Devuelve el primer atributo existente en obj de la lista names, o None."""
    for n in names:
        if hasattr(obj, n):
            return getattr(obj, n)
    return None

def _join_nonempty(parts, sep=" "):
    return sep.join([str(p) for p in parts if p not in (None, "", "None")]) or None

class TrazabilidadView(APIView):
    """
    GET /api/trazabilidad/?lote=<id>&inicio=YYYY-MM-DD&fin=YYYY-MM-DD
    Respuesta: [{id, tipo, fecha, descripcion}, ...]
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        lote_id = request.query_params.get("lote")
        inicio  = parse_date(request.query_params.get("inicio"))
        fin     = parse_date(request.query_params.get("fin"))

        if not lote_id or not inicio or not fin:
            return Response([], status=200)
        if inicio > fin:
            inicio, fin = fin, inicio

        eventos = []

        def collect(model_label, model_name, tipo, desc_fields=None, date_fields=None, model_slug=None):
            Model = _get_model(model_label, model_name)
            if not Model:
                return
            model_slug = model_slug or model_name.lower()  # p.ej. 'siembra', 'cobertura'
            date_fields = date_fields or ["fecha", "fecha_evento", "fecha_realizacion", "fecha_aplicacion"]

            # detectar campo fecha
            model_field_names = [f.name for f in Model._meta.get_fields()]
            fecha_field = next((f for f in date_fields if f in model_field_names), None)
            if not fecha_field:
                return

            qs = Model.objects.filter(lote_id=lote_id, **{f"{fecha_field}__range": [inicio, fin]})

            for obj in qs:
                fecha_val = getattr(obj, fecha_field, None)
                desc_fields_default = [
                    "descripcion", "detalle", "observaciones",
                    "cultivo", "cultivo_cobertura", "variedad",
                    "producto", "producto_aplicar",
                    "dosis", "unidad", "volumen",
                    "rinde", "unidad_rinde", "tipo"
                ]
                fields_to_use = desc_fields or desc_fields_default

                desc_parts = []
                for name in fields_to_use:
                    if hasattr(obj, name):
                        val = getattr(obj, name)
                        if name == "rinde" and hasattr(obj, "unidad_rinde"):
                            desc_parts.append(f"Rinde: {val} {getattr(obj,'unidad_rinde') or ''}".strip())
                        elif name == "dosis" and hasattr(obj, "unidad"):
                            if val not in (None, ""):
                                desc_parts.append(f"{val} {getattr(obj,'unidad') or ''}".strip())
                        else:
                            if val not in (None, ""):
                                desc_parts.append(val)
                descripcion = " - ".join(str(p) for p in desc_parts if str(p).strip()) or None

                eventos.append({
                    "id": f"{tipo}-{obj.id}",
                    "tipo": tipo,
                    "fecha": fecha_val,
                    "descripcion": descripcion,
                    "source_model": model_slug,   # <- NUEVO
                    "source_pk": obj.id,         # <- NUEVO
                })

        # === SIEMBRA ===
        collect("lotes", "Siembra", "SIEMBRA", desc_fields=["cultivo", "variedad", "densidad"])

        # === COBERTURA ===
        collect("lotes", "Cobertura", "COBERTURA", desc_fields=["descripcion", "cultivo_cobertura", "variedad", "densidad"])
        # === COSECHA ===
        collect("lotes", "Cosecha", "COSECHA", desc_fields=["rinde", "unidad_rinde", "observaciones"])

         # === TAREAS (fertilización, malezas, laboreo, riego, fitosanitaria, otra) ===
        tipo_map = {
            "fertilizacion": "FERTILIZACION",
            "maleza": "MALEZAS",
            "laboreo": "LABOREO",
            "riego": "RIEGO",
            "fitosanitaria": "FITOSANITARIA",
            "otra": "OTRA",
        }

        tareas_qs = Tarea.objects.filter(
            lote_id=lote_id,
            fecha__range=[inicio, fin]
        ).order_by("fecha", "id")

        for t in tareas_qs:
            tipo = tipo_map.get(t.tipo, "OTRA")

            # armamos descripción según el tipo
            if t.tipo == "fertilizacion":
                parts = [
                    t.tipo_fertilizante,
                    t.producto_aplicar,
                    t.concentracion,
                    t.fabricante,
                    _join_nonempty([t.litros_por_ha, "L/Kg por Ha"]),
                    _join_nonempty([t.hectareas_aplicadas, "ha"]),
                    t.observaciones,
                ]
            elif t.tipo == "maleza":
                parts = [
                    t.tipo_fitosanitario,
                    t.plaga_maleza,
                    _join_nonempty([t.lkg_por_ha, "L/Kg/Ha"]),
                    t.observaciones,
                ]
            elif t.tipo == "fitosanitaria":
                parts = [
                    t.tipo_fitosanitario,
                    t.producto_aplicar or t.plaga_maleza,  # usa lo que tengas cargado
                    _join_nonempty([t.lkg_por_ha, "L/Kg/Ha"]),
                    t.observaciones,
                ]
            elif t.tipo == "riego":
                parts = [
                    t.tipo_riego,
                    _join_nonempty([t.volumen, ""]),
                    t.observaciones,
                ]
            elif t.tipo == "laboreo":
                parts = [
                    t.tipo_laboreo,
                    _join_nonempty([t.operario, "operario"]),
                    t.observaciones,
                ]
            else:  # "otra"
                parts = [t.observaciones]

            descripcion = " - ".join([p for p in parts if p and str(p).strip()])

            eventos.append({
                "id": f"{tipo}-T{t.id}",
                "tipo": tipo,
                "fecha": t.fecha,
                "descripcion": descripcion or None,
                "source_model": "tarea",
                "source_pk": t.id,
            })
        # Orden cronológico
        eventos.sort(key=lambda e: (e["fecha"] or "", e["id"]))
        return Response(eventos, status=200)