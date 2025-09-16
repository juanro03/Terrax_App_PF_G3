from rest_framework import serializers
from .models import Lote  # o como se llame tu modelo
from .models import Siembra
from .models import Cosecha
from .models import Campania
import re
from .models import Cobertura


class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = '__all__'  

class SiembraSerializer(serializers.ModelSerializer):
    lote_nombre = serializers.CharField(source='lote.nombre', read_only=True)
    class Meta:
        model = Siembra
        fields = '__all__'
class CosechaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cosecha
        fields = '__all__'
    def validate_rinde(self, value):
        pattern = r"^\d{1,3}(,\d{1,2})?\s?tn/ha$"
        if not re.match(pattern, value.strip(), re.IGNORECASE):
            raise serializers.ValidationError("El rinde debe tener el formato 'n,nn tn/ha', por ejemplo: 3,45 tn/ha.")
        return value

class CampaniaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campania
        fields = '__all__'

class CoberturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cobertura
        fields = '__all__'
