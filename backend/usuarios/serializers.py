from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'rol', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        # Guarda la contraseña tal cual, sin encriptar
        return Usuario.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Permite actualizar la contraseña sin encriptar
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance