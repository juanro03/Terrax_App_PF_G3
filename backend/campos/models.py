from django.db import models
from usuarios.models import Usuario   # ya lo tenés importado
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
    latitud = models.FloatField(null=True, blank=True)
    longitud = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.nombre


class Servicio(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="servicios")  # <-- corregido
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE, related_name="servicios")
    tipo_tarea = models.CharField(max_length=200)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    observaciones = models.TextField(blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo_tarea} - {self.campo.nombre} ({self.usuario.username})"
