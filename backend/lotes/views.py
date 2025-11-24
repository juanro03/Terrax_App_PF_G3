from django.apps import apps
from django.utils.dateparse import parse_date
from rest_framework import status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from tareas.models import Tarea
from django.db import transaction
from .models import (Lote, Siembra, Cosecha, Campania, Cobertura)
from .serializers import (LoteSerializer, SiembraSerializer, CosechaSerializer, CampaniaSerializer, CoberturaSerializer)
from .services import calcular_centroide
from .services import obtener_alertas_para_lote
from django.core.mail import send_mail
from django.conf import settings

#   LOTES
class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer
    permission_classes = [AllowAny]  # Cambiá a IsAuthenticated si lo necesitás

    @action(detail=False, methods=["get"], url_path=r"por-campo/(?P<campo_id>[^/.]+)")
    def obtener_lotes_por_campo(self, request, campo_id=None):
        """
        GET /api/lotes/por-campo/<campo_id>/
        """
        lotes = Lote.objects.filter(campo_id=campo_id)
        serializer = self.get_serializer(lotes, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=["get"], url_path="clima")
    def obtener_clima(self, request, pk=None):
        lote = self.get_object()
        lat, lon = calcular_centroide(lote.coordenadas)

        if not lat or not lon:
            return Response({"error": "El lote no tiene coordenadas válidas."}, status=400)

        # Ejemplo: respuesta temporal
        return Response({
            "latitud": lat,
            "longitud": lon,
            "mensaje": "Coordenadas listas para consultar clima"
        })
    @action(detail=True, methods=["get"], url_path="alertas")
    @action(detail=True, methods=["get"], url_path="alertas")
    @action(detail=True, methods=["get"], url_path="alertas")
    def alertas_climaticas(self, request, pk=None):
        lote = self.get_object()

        eventos, lat, lon = obtener_alertas_para_lote(lote.coordenadas)

        return Response({
            "lote": lote.nombre,
            "campo": lote.campo.nombre,
            "provincia": lote.campo.provincia,
            "localidad": lote.campo.localidad,
            "lat": lat,
            "lon": lon,
            "alertas": eventos
        })
    def _get_email_destino(self, request, lote):
        """
        Obtiene el mail del productor al que se le debe avisar:
        1) Primero usa Campo.propietario.email (si existe)
        2) Si no, usa request.user.email si está autenticado
        """
        campo = lote.campo

        # 1) Mail del propietario del campo
        propietario = getattr(campo, "propietario", None)
        if propietario and getattr(propietario, "email", None):
            return propietario.email

        # 2) Fallback: usuario autenticado
        user = getattr(request, "user", None)
        if user and getattr(user, "is_authenticated", False) and getattr(user, "email", None):
            return user.email

        return None

#   SIEMBRAS
class SiembraViewSet(viewsets.ModelViewSet):
    queryset = Siembra.objects.all()
    serializer_class = SiembraSerializer

    # Filtros /api/siembras/?start=&end=&campo=&lote=
    def get_queryset(self):
        qs = super().get_queryset()

        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        campo = self.request.query_params.get("campo")
        lote = self.request.query_params.get("lote")

        if campo:
            qs = qs.filter(lote__campo_id=campo)
        if lote:
            qs = qs.filter(lote_id=lote)
        if start:
            qs = qs.filter(fecha__gte=start)
        if end:
            qs = qs.filter(fecha__lt=end)

        return qs.select_related("lote").order_by("fecha", "id")

    @action(detail=False, methods=["get"], url_path=r"por-lote/(?P<lote_id>[^/.]+)")
    def obtener_por_lote(self, request, lote_id=None):
        """
        GET /api/siembras/por-lote/<lote_id>/
        Devuelve la ÚLTIMA siembra (por fecha) del lote.
        """
        siembra = (
            Siembra.objects.filter(lote_id=lote_id)
            .order_by("-fecha", "-id")
            .first()
        )
        if not siembra:
            return Response(
                {"error": "No hay siembra registrada aún."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(siembra)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        siembra = serializer.save()
        lote = siembra.lote

        # Guardas de estado
        if lote.estado == "sembrado":
            raise serializers.ValidationError({"error": "El lote ya tiene una siembra activa."})

        lote.estado = "sembrado"
        lote.save(update_fields=["estado"])


#   COBERTURAS
class CoberturaViewSet(viewsets.ModelViewSet):
    queryset = Cobertura.objects.all()
    serializer_class = CoberturaSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        campo = self.request.query_params.get("campo")
        lote = self.request.query_params.get("lote")

        if campo:
            qs = qs.filter(lote__campo_id=campo)
        if lote:
            qs = qs.filter(lote_id=lote)
        if start:
            qs = qs.filter(fecha__gte=start)
        if end:
            qs = qs.filter(fecha__lt=end)

        return qs.select_related("lote").order_by("fecha", "id")

    @action(detail=False, methods=["get"], url_path=r"por-lote/(?P<lote_id>[^/.]+)")
    def por_lote(self, request, lote_id=None):
        """
        GET /api/coberturas/por-lote/<lote_id>/
        Devuelve la ÚLTIMA cobertura (por fecha) del lote.
        """
        cobertura = (
            Cobertura.objects.filter(lote_id=lote_id)
            .order_by("-fecha", "-id")
            .first()
        )
        if not cobertura:
            return Response(
                {"error": "No hay cobertura registrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(cobertura)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        cobertura = serializer.save()
        lote = cobertura.lote

        if lote.estado == "sembrado":
            raise serializers.ValidationError({"error": "No se puede registrar cobertura: el lote está sembrado."})
        

        lote.estado = "cobertura"
        lote.save(update_fields=["estado"])

#   COSECHAS 
class CosechaViewSet(viewsets.ModelViewSet):
    """
    - GET  /api/cosechas/            (lista con filtros)
    - GET  /api/cosechas/<id>/       (detalle)
    - POST /api/cosechas/            (crear, admite archivo_rendimiento)
    """
    queryset = Cosecha.objects.all()
    serializer_class = CosechaSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()

        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        campo = self.request.query_params.get("campo")
        lote = self.request.query_params.get("lote")

        if campo:
            qs = qs.filter(lote__campo_id=campo)
        if lote:
            qs = qs.filter(lote_id=lote)
        if start:
            qs = qs.filter(fecha__gte=start)
        if end:
            qs = qs.filter(fecha__lt=end)

        return qs.select_related("lote").order_by("fecha", "id")
    
    def perform_create(self, serializer):
        cosecha = serializer.save()
        lote = cosecha.lote

        if not hasattr(lote, "siembra"):
            raise serializers.ValidationError({"error": "No se puede cosechar sin una siembra activa."})

        # (Opcional) coherencia temporal
        if cosecha.fecha < lote.siembra.fecha:
            raise serializers.ValidationError({"error": "La fecha de cosecha no puede ser anterior a la siembra."})

        lote.estado = "cosechado"
        lote.save(update_fields=["estado"])

#   CAMPAÑAS
class CampaniaViewSet(viewsets.ModelViewSet):
    """
    - GET  /api/campanias/               (lista con filtros)
    - GET  /api/campanias/<id>/          (detalle)
    - GET  /api/campanias/por-lote/<id>/ (todas las campañas del lote, ordenadas)
    - GET  /api/campanias/ultima/<id>/   (última campaña del lote)
    """
    queryset = Campania.objects.all()
    serializer_class = CampaniaSerializer
    parser_classes = [MultiPartParser, FormParser]


    def get_queryset(self):
        qs = super().get_queryset().select_related("lote")

        # Filtros: /api/campanias/?campo=&lote=&start=&end=&start_cosecha=&end_cosecha=
        campo = self.request.query_params.get("campo")
        lote  = self.request.query_params.get("lote")
        start = self.request.query_params.get("start")           # fecha_siembra >= start
        end   = self.request.query_params.get("end")             # fecha_siembra <  end
        start_cosecha = self.request.query_params.get("start_cosecha")
        end_cosecha   = self.request.query_params.get("end_cosecha")

        if campo:
            qs = qs.filter(lote__campo_id=campo)
        if lote:
            qs = qs.filter(lote_id=lote)
        if start:
            qs = qs.filter(fecha_siembra__gte=start)
        if end:
            qs = qs.filter(fecha_siembra__lt=end)
        if start_cosecha:
            qs = qs.filter(fecha_cosecha__gte=start_cosecha)
        if end_cosecha:
            qs = qs.filter(fecha_cosecha__lt=end_cosecha)

        return qs.order_by("-fecha_siembra", "-id")

    @action(detail=False, methods=["get"], url_path=r"por-lote/(?P<lote_id>[^/.]+)")
    def por_lote(self, request, lote_id=None):
        """
        GET /api/campanias/por-lote/<lote_id>/
        Todas las campañas del lote (más reciente primero)
        """
        qs = self.get_queryset().filter(lote_id=lote_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path=r"ultima/(?P<lote_id>[^/.]+)")
    def ultima(self, request, lote_id=None):

    
        """
        GET /api/campanias/ultima/<lote_id>/
        Devuelve la última campaña del lote (o 404 si no hay)
        """
        obj = self.get_queryset().filter(lote_id=lote_id).first()
        if not obj:
            return Response({"error": "No hay campañas registradas."}, status=404)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance: Campania = self.get_object()

        # Borrar archivos asociados si existen (opcional pero recomendado)
        if instance.analisis_suelo and default_storage.exists(instance.analisis_suelo.name):
            default_storage.delete(instance.analisis_suelo.name)
        if instance.archivo_rendimiento and default_storage.exists(instance.archivo_rendimiento.name):
            default_storage.delete(instance.archivo_rendimiento.name)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

#   FINALIZAR CAMPAÑA / HISTORIAL
class FinalizarCampaniaView(APIView):
    @transaction.atomic
    def post(self, request, lote_id):
        
        
        try:
            siembra = Siembra.objects.get(lote_id=lote_id)
        except Siembra.DoesNotExist:
            return Response({"error": "No se encontró una siembra asociada al lote."}, status=404)

        cosecha = (Cosecha.objects
                   .filter(lote_id=lote_id)
                   .order_by("-fecha", "-id")
                   .first())
        if not cosecha:
            return Response({"error": "No se encontró una cosecha asociada al lote."}, status=404)
        
        lote = siembra.lote

        # --- tomar cobertura si existe ---
        cobertura = None
        try:
            cobertura = lote.cobertura 
        except Cobertura.DoesNotExist:
            cobertura = None

        # 1) Snapshot histórico
        Campania.objects.create(
            lote=lote,
            # Siembra
            fecha_siembra=siembra.fecha,
            cultivo=siembra.cultivo,
            variedad=siembra.variedad,
            densidad=siembra.densidad,
            unidad_densidad=siembra.unidad_densidad,
            ventana_cosecha=siembra.ventana_cosecha,
            analisis_suelo=siembra.analisis_suelo,
            # Cosecha
            fecha_cosecha=cosecha.fecha,
            rinde=cosecha.rinde,
            archivo_rendimiento=cosecha.archivo_rendimiento,
            # Cobertura (solo si existía)
            fecha_cobertura=(cobertura.fecha if cobertura else None),
            cultivo_cobertura=(cobertura.cultivo if cobertura else None),
            variedad_cobertura=(cobertura.variedad if cobertura else None),
            densidad_cobertura=(cobertura.densidad if cobertura else None),
        )

        # 2) Limpiar ciclo y volver a barbecho
        siembra.delete()
        Cosecha.objects.filter(lote_id=lote_id).delete()
        Cobertura.objects.filter(lote_id=lote_id).delete()
        lote.estado = "barbecho"
        lote.save(update_fields=["estado"])

        return Response(
            {"mensaje": "Campaña finalizada y registrada en historial.", "lote_estado": lote.estado},
            status=200
        )

class HistorialPorLoteView(APIView):
    def get(self, request, lote_id):
        historial = Campania.objects.filter(lote_id=lote_id).order_by("-fecha_siembra", "-id")
        serializer = CampaniaSerializer(historial, many=True)
        return Response(serializer.data)


def _get_model(app_label, model_name):
    try:
        return apps.get_model(app_label, model_name)
    except LookupError:
        return None

def _join_nonempty(parts, sep=" "):
    return sep.join([str(p) for p in parts if p not in (None, "", "None")]) or None

class TrazabilidadView(APIView):
    """
    GET /api/trazabilidad/?lote=<id>&inicio=YYYY-MM-DD&fin=YYYY-MM-DD
    Respuesta: [{id, tipo, fecha, descripcion, source_model, source_pk}, ...]
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
            model_slug = model_slug or model_name.lower()
            date_fields = date_fields or ["fecha", "fecha_evento", "fecha_realizacion", "fecha_aplicacion"]

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
                    "source_model": model_slug,
                    "source_pk": obj.id,
                })

        # Siembra / Cobertura / Cosecha
        collect("lotes", "Siembra", "SIEMBRA", desc_fields=["cultivo", "variedad", "densidad"])
        collect("lotes", "Cobertura", "COBERTURA", desc_fields=["cultivo", "variedad", "densidad"])
        collect("lotes", "Cosecha", "COSECHA", desc_fields=["rinde", "unidad_rinde", "observaciones"])

        # Tareas
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
                    t.producto_aplicar or t.plaga_maleza,
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
            else:
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

        eventos.sort(key=lambda e: (e["fecha"] or "", e["id"]))
        return Response(eventos, status=200)
