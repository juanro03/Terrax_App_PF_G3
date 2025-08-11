from rest_framework import serializers
from tareas.models import Tarea

class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = '__all__'
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
