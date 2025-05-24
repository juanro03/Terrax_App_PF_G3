from django.db import models
from usuarios.models import Usuario
from django.utils import timezone


class Campo(models.Model):
    nombre = models.CharField(max_length=100)
    provincia = models.CharField(max_length=100)
    localidad = models.CharField(max_length=100)
    imagen_satelital = models.ImageField(upload_to='imagenes/', null=True, blank=True)
    propietario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='campos', null=True)
    cantidadLotes = models.PositiveIntegerField(default=1)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre
