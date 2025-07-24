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
        user = self.request.user

        if user.rol == 'admin':
            return Reporte.objects.all()

        queryset = Reporte.objects.filter(productor=user)

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

        if not user.rol == 'admin':
            raise ValidationError("Solo los administradores pueden crear reportes.")

        campo = serializer.validated_data['campo']
        lote = serializer.validated_data['lote']
        productor = serializer.validated_data['productor']

        if campo.propietario != productor:
            raise ValidationError("El campo no pertenece al productor indicado.")
        if lote.campo != campo:
            raise ValidationError("El lote no pertenece al campo indicado.")

        serializer.save()

    def destroy(self, request, *args, **kwargs):
            user = request.user

            if user.rol != 'admin':
                raise ValidationError("Solo los administradores pueden eliminar reportes.")

            return super().destroy(request, *args, **kwargs)