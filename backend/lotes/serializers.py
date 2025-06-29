from rest_framework import serializers
from .models import Lote  # o como se llame tu modelo
from .models import Siembra

class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = '__all__'  # o poné los campos que quieras exponer

class SiembraSerializer(serializers.ModelSerializer):
    lote_nombre = serializers.CharField(source='lote.nombre', read_only=True)
    class Meta:
        model = Siembra
        fields = '__all__'
