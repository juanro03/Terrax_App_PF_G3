from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = '__all__'

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except DjangoValidationError as e:
            # e.message_dict es más útil si usaste ValidationError con dict
            raise serializers.ValidationError(e.message_dict or e.messages)
