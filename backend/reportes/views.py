from django.shortcuts import render
from rest_framework import viewsets
from .models import Reporte
from .serializers import ReporteSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

class ReporteViewSet(viewsets.ModelViewSet):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Solo ve sus propios reportes
        queryset = queryset.filter(productor=user)

        # Filtro opcional por campo y lote
        campo_id = self.request.query_params.get('campo')
        lote_id = self.request.query_params.get('lote')
        if campo_id:
            queryset = queryset.filter(campo_id=campo_id)
        if lote_id:
            queryset = queryset.filter(lote_id=lote_id)

        return queryset
    
    def perform_create(self, serializer):
        user = self.request.user
        campo = serializer.validated_data['campo']
        lote = serializer.validated_data['lote']

        # Validar que el campo le pertenezca al usuario
        if campo.propietario != user:
            raise ValidationError("Este campo no pertenece al usuario autenticado.")

        # Validar que el lote esté dentro del campo
        if lote.campo != campo:
            raise ValidationError("Este lote no pertenece al campo seleccionado.")

        serializer.save(productor=user)

