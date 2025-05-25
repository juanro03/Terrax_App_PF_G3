from rest_framework import serializers
from .models import Campo

class CampoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campo
        fields = '__all__'
        extra_kwargs = {
            "imagen_satelital": {"required": False, "allow_null": True},
            "observacion": {"required": False, "allow_null": True},
            "ubicacion": {"required": False, "allow_blank": True},
            "propietario": {"read_only": True},

        }