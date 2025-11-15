from django.db import models
from campos.models import Campo

class Lote(models.Model):
    ESTADOS = [
        ("barbecho", "Barbecho"),
        ("sembrado", "Sembrado"),
        ("cosechado", "Cosechado"),
        ("cobertura", "Cobertura"),
    ]

    nombre = models.CharField(max_length=100)
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE, related_name='lotes')
    area = models.FloatField(help_text='Área del lote en hectáreas')
    estado = models.CharField(max_length=20, choices=ESTADOS, default="barbecho")
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
    ventana_cosecha = models.DateField()
    analisis_suelo = models.FileField(upload_to="siembra/analisis/", null=True, blank=True)

    def __str__(self):
        return f"{self.cultivo} - Lote {self.lote.nombre}"


class Cosecha(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE)
    fecha = models.DateField()
    rinde = models.CharField(max_length=100)
    archivo_rendimiento = models.FileField(upload_to='cosechas/', blank=True, null=True)


class Cobertura(models.Model):
    lote = models.OneToOneField(Lote, on_delete=models.CASCADE, related_name="cobertura")
    fecha = models.DateField()
    cultivo = models.CharField(max_length=100)
    variedad = models.CharField(max_length=100)
    densidad = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Cobertura {self.cultivo} - {self.lote.nombre}"



class Campania(models.Model):
    lote = models.ForeignKey(Lote, on_delete=models.CASCADE, related_name="campanias")
    
    # Datos de siembra
    fecha_siembra = models.DateField()
    cultivo = models.CharField(max_length=100)
    variedad = models.CharField(max_length=100)
    densidad = models.DecimalField(max_digits=10, decimal_places=2)
    unidad_densidad = models.CharField(max_length=10, choices=[("Kg/Ha", "Kg/Ha"), ("Pl/Ha", "Pl/Ha")])
    ventana_cosecha = models.DateField()
    analisis_suelo = models.FileField(upload_to="campanias/siembra/", null=True, blank=True)
    
    # Datos de cosecha
    fecha_cosecha = models.DateField(null=True, blank=True)
    rinde = models.CharField(max_length=100, blank=True)
    archivo_rendimiento = models.FileField(upload_to="campanias/cosechas/", null=True, blank=True)

    # Datos de Cobertura (nuevo, todo opcional)
    fecha_cobertura = models.DateField(null=True, blank=True)
    cultivo_cobertura = models.CharField(max_length=100, null=True, blank=True)
    variedad_cobertura = models.CharField(max_length=100, null=True, blank=True)
    densidad_cobertura = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Control
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Campaña {self.cultivo} ({self.lote.nombre}) - {self.fecha_siembra.strftime('%Y-%m-%d')}"
