from django.db import models
from django.core.exceptions import ValidationError
from lotes.models import Lote

class Tarea(models.Model):
    TIPO_CHOICES = [
        ('fertilizacion', 'Fertilización'),
        ('maleza', 'Manejo de Malezas'),
        ('laboreo', 'Laboreos de Lote'),
        ('riego', 'Riego'),
        ('fitosanitaria', 'Aplicación Fitosanitaria'),
        ('otros', 'Otros'),  # <-- clave 'otros' (coincide con frontend)
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

    # Campo libre para "Otros" (titulo/resumen corto)
    actividad_libre = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Título o breve descripción cuando tipo = 'Otros'"
    )

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

    class Meta:
        ordering = ['-fecha', '-creado_en']

    def __str__(self):
        lote_nombre = getattr(self.lote, 'nombre', str(self.lote))
        return f"{self.get_tipo_display()} - {lote_nombre} ({self.fecha})"

    def clean(self):
        """
        Validaciones por tipo:
         - Si tipo == 'otros' requerir al menos actividad_libre o observaciones.
         - Podés extender y agregar validaciones por fertilización, riego, etc.
        """
        super().clean()
        if self.tipo == 'otros':
            if not (self.actividad_libre and self.actividad_libre.strip()) and not (self.observaciones and self.observaciones.strip()):
                raise ValidationError("Para actividades de tipo 'Otros' se requiere un título corto (actividad_libre) o observaciones.")

        # Ejemplo opcional: obligar fecha (ya es required por campo), o validaciones específicas:
        # if self.tipo == 'fertilizacion' and not self.tipo_fertilizante:
        #     raise ValidationError("En Fertilización se debe indicar el tipo de fertilizante.")

    # Si querés correr clean() en cada save
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)