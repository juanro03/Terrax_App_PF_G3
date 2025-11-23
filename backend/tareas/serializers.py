from rest_framework import serializers
from tareas.models import Tarea


class TareaSerializer(serializers.ModelSerializer):
    # Campos extra SOLO lectura
    lote_nombre = serializers.CharField(source="lote.nombre", read_only=True)
    campo_nombre = serializers.CharField(source="lote.campo.nombre", read_only=True)
    campo_id = serializers.IntegerField(source="lote.campo.id", read_only=True)

    class Meta:
        model = Tarea
        fields = [
            "id",
            "tipo",
            "fecha",
            "observaciones",
            "dosis_tipo",
            "lote",
            "lote_nombre",
            "campo_id",
            "campo_nombre",

            "tipo_fertilizante",
            "de",
            "producto_aplicar",
            "concentracion",
            "fabricante",
            "litros_por_ha",
            "hectareas_aplicadas",
            "mapa_adjunto",

            "tipo_riego",
            "volumen",

            "tipo_laboreo",
            "operario",

            "tipo_fitosanitario",
            "plaga_maleza",
            "lkg_por_ha",
            "mapa_variable",

            "creado_en",
        ]
        extra_kwargs = {
            'dosis_tipo': {'required': False},
            'tipo_fertilizante': {'required': False},
            'de': {'required': False},
            'producto_aplicar': {'required': False},
            'concentracion': {'required': False},
            'fabricante': {'required': False},
            'litros_por_ha': {'required': False},
            'hectareas_aplicadas': {'required': False},
            'mapa_adjunto': {'required': False},
            'tipo_riego': {'required': False},
            'volumen': {'required': False},
            'tipo_laboreo': {'required': False},
            'operario': {'required': False},
            'tipo_fitosanitario': {'required': False},
            'plaga_maleza': {'required': False},
            'lkg_por_ha': {'required': False},
            'mapa_variable': {'required': False},
            'observaciones': {'required': False},
        }
