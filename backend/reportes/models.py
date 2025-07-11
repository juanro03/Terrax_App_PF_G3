from django.db import models
from usuarios.models import Usuario
from campos.models import Campo
from lotes.models import Lote

class Reporte(models.Model):
    productor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE)
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    observaciones = models.TextField(blank=True)
    archivo_pdf = models.FileField(upload_to='reportes/')
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.lote})"
