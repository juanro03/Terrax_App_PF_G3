from django.contrib import admin

from django.contrib import admin
from .models import Reporte

@admin.register(Reporte)
class ReporteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo_reporte', 'productor', 'campo', 'lote', 'fecha_reporte')
    list_filter = ('tipo_reporte', 'campo', 'lote')
    search_fields = ('nombre', 'observaciones')

