from django.db import models
from campos.models import Campo

class Lote(models.Model):
    nombre = models.CharField(max_length=100)
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE, related_name='lotes')
    area = models.FloatField(help_text='Área del lote en hectáreas')
    imagen_satelital = models.ImageField(upload_to='imagenes/lotes/', null=True, blank=True)
    imagen_dron = models.ImageField(upload_to='imagenes/drones/', null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.campo.nombre})"
