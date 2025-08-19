from django.db import models
from lotes.models import Lote

class Tarea(models.Model):
    TIPO_CHOICES = [
        ('fertilizacion', 'Fertilización'),
        ('maleza', 'Manejo de Malezas'),
        ('laboreo', 'Laboreos de Lote'),
        ('riego', 'Riego'),
        ('fitosanitaria', 'Aplicación Fitosanitaria'),
        ('otra', 'Otra'),
    ]
    DOSIS_TIPO_CHOICES = [
        ('fija', 'Fija'),
        ('variable', 'Variable'),
        ('', 'No aplica'),
    ]
    dosis_tipo = models.CharField(max_length=10, choices=DOSIS_TIPO_CHOICES, blank=True, default='')

    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name='tareas')
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    fecha = models.DateField()
    observaciones = models.TextField(blank=True)

    # FERTILIZACIÓN
    tipo_fertilizante = models.CharField(max_length=100, blank=True, null=True)
    de = models.CharField(max_length=100, blank=True, null=True)
    producto_aplicar = models.CharField(max_length=100, blank=True, null=True)
    concentracion = models.CharField(max_length=100, blank=True, null=True)
    fabricante = models.CharField(max_length=100, blank=True, null=True)
    litros_por_ha = models.CharField(max_length=50, blank=True, null=True)
    hectareas_aplicadas = models.CharField(max_length=50, blank=True, null=True)
    mapa_adjunto = models.FileField(upload_to='mapas_fertilizacion/', blank=True, null=True)

    # RIEGO
    tipo_riego = models.CharField(max_length=100, blank=True, null=True)
    volumen = models.CharField(max_length=50, blank=True, null=True)

    # LABOREOS DE LOTE
    tipo_laboreo = models.CharField(max_length=100, blank=True, null=True)
    operario = models.CharField(max_length=100, blank=True, null=True)

    # MANEJO DE MALEZAS y FITOSANITARIA
    tipo_fitosanitario = models.CharField(max_length=100, blank=True, null=True)
    plaga_maleza = models.CharField(max_length=100, blank=True, null=True)
    lkg_por_ha = models.CharField(max_length=50, blank=True, null=True)
    mapa_variable = models.FileField(upload_to='mapas_maleza/', blank=True, null=True)

    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.lote.nombre} ({self.fecha})"