from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__'

    def validate(self, data):
        categoria = data.get("categoria")

        if categoria == "SEMILLAS":
            required_fields = ["cultivo", "variedad", "dias_madurez"]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: "Este campo es obligatorio para semillas."})
        else:
            required_fields = ["nombre", "tipo"]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError({field: "Este campo es obligatorio para esta categoría."})

        return data