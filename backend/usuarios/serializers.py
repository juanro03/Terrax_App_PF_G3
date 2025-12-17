# usuarios/serializers.py
from rest_framework import serializers
from django.utils.timezone import now
from .models import Usuario
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# Serializer para login con email
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["rol"] = user.rol
        return token


class UsuarioSerializer(serializers.ModelSerializer):
    # password solo para alta/cambio explícito
    password = serializers.CharField(write_only=True, required=False)

    # 👉 fecha_alta solo lectura (la setea el modelo con auto_now_add)
    fecha_alta = serializers.DateTimeField(read_only=True)

    # 👉 campo calculado: días de uso desde la fecha de alta
    dias_uso = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "imagen_perfil",
            "rol",
            "is_active",
            "fecha_alta",
            "dias_uso",
        ]
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": True},
        }

    def get_dias_uso(self, obj):
        """
        Calcula la cantidad de días de uso como diferencia
        entre hoy y la fecha_alta del usuario.
        """
        if not obj.fecha_alta:
            return None
        return (now().date() - obj.fecha_alta.date()).days

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Por si acaso, evitamos guardar sin password
            user.set_password(Usuario.objects.make_random_password())
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

from rest_framework import serializers
from .models import NotificacionMora


class NotificacionMoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificacionMora
        fields = "__all__"