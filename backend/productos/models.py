from django.db import models

class Producto(models.Model):
    nombre = models.CharField(max_length=100, blank=True, null=True)  # Ahora opcional
    categoria = models.CharField(max_length=100)

    # Campos específicos para SEMILLAS
    cultivo = models.CharField(max_length=100, blank=True, null=True)
    variedad = models.CharField(max_length=100, blank=True, null=True)
    dias_madurez = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        if self.categoria == "SEMILLAS":
            return f"{self.cultivo or 'Semilla sin cultivo'} - {self.variedad or 'Variedad desconocida'}"
        return self.nombre or "Producto sin nombre"