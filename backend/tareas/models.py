from django.db import models
from lotes.models import Lote

class Tarea(models.Model):
    TIPO_CHOICES = [
        ('siembra', 'Siembra'),
        ('aplicacion', 'Aplicación'),
        ('riego', 'Riego'),
        ('cosecha', 'Cosecha'),
        ('fertilizacion', 'Fertilización'),
        ('otra', 'Otra'),
    ]

    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name='tareas')
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    descripcion = models.TextField(blank=True)
    fecha = models.DateField()
    estado = models.CharField(max_length=20, choices=[('pendiente', 'Pendiente'), ('completada', 'Completada')], default='pendiente')
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.lote.nombre} ({self.fecha})"
