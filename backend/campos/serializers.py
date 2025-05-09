from rest_framework import serializers
from .models import Campo

class CampoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campo
        fields = '__all__'
    imagen_satelital = serializers.ImageField(required=False, allow_null=True)