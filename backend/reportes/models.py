# reportes/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from usuarios.models import Usuario
from campos.models import Campo
from lotes.models import Lote

class Reporte(models.Model):
    productor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE)
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    tipo_reporte = models.CharField(max_length=50)
    observaciones = models.TextField(blank=True)
    archivo_pdf = models.FileField(upload_to='reportes/')
    fecha_reporte = models.DateTimeField(auto_now_add=True)

    def __str__(self):
      return f"{self.nombre} ({self.lote})"


class Anotacion(models.Model):
    lote = models.ForeignKey(
        Lote, on_delete=models.CASCADE, related_name="anotaciones"
    )

    x_pct = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    y_pct = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    texto = models.CharField(max_length=200)
    color = models.CharField(max_length=7, default="#e74c3c")

    creado_por = models.ForeignKey(
        Usuario, null=True, blank=True, on_delete=models.SET_NULL, related_name="anotaciones"
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=["lote", "creado_en"]),
        ]
        ordering = ["orden", "id"]

    def __str__(self):
        return f"{self.texto[:30]}… (lote:{self.lote_id})"
