from django.db import models
from campos.models import Campo

class Lote(models.Model):
    nombre = models.CharField(max_length=100)
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE, related_name='lotes')
    area = models.FloatField(help_text='Área del lote en hectáreas')
    observacion = models.TextField(blank=True)
    coordenadas = models.JSONField(null=True, blank=True)
    imagen_satelital = models.ImageField(upload_to='imagenes/lotes/', null=True, blank=True)
    imagen_dron = models.ImageField(upload_to='imagenes/drones/', null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.campo.nombre})"
class Siembra(models.Model):
    lote = models.OneToOneField(Lote, on_delete=models.CASCADE, related_name="siembra")
    fecha = models.DateField()
    cultivo = models.CharField(max_length=100)
    variedad = models.CharField(max_length=100)
    densidad = models.DecimalField(max_digits=10, decimal_places=2)
    unidad_densidad = models.CharField(max_length=10, choices=[("Kg/Ha", "Kg/Ha"), ("Pl/Ha", "Pl/Ha")])
    ventana_cosecha = models.CharField(max_length=100)
    analisis_suelo = models.FileField(upload_to="siembra/analisis/", null=True, blank=True)

    def __str__(self):
        return f"{self.cultivo} - Lote {self.lote.nombre}"