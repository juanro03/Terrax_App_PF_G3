# reportes/serializers.py
from rest_framework import serializers
from .models import Reporte, Anotacion

class ReporteSerializer(serializers.ModelSerializer):
    lote_nombre = serializers.CharField(source="lote.nombre", read_only=True)

    class Meta:
        model = Reporte
        fields = "__all__"

class AnotacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anotacion
        fields = "__all__"
        read_only_fields = ["creado_por", "creado_en", "actualizado_en"]
