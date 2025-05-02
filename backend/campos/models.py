from django.db import models
from usuarios.models import Usuario
from django.utils import timezone


class Campo(models.Model):
    nombre = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=200, blank=True)
    imagen_satelital = models.ImageField(upload_to='imagenes_campos/', blank=True, null=True)
    propietario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='campos', null=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre
