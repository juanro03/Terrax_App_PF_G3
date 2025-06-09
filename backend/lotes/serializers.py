from rest_framework import serializers
from .models import Lote  # o como se llame tu modelo

class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = '__all__'  # o poné los campos que quieras exponer
