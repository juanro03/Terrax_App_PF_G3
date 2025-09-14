# reportes/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from reportes.views import (
    ReporteViewSet,
    LoteAnotacionViewSet,
    ReporteAnotacionProxyViewSet,
)
from lotes.views import LoteViewSet 

router = DefaultRouter()
router.register(r"reportes", ReporteViewSet, basename="reportes")
router.register(r"lotes", LoteViewSet, basename="lotes")

# anidación: lotes -> anotaciones
nested_lotes = NestedDefaultRouter(router, r"lotes", lookup="lote")
nested_lotes.register(r"anotaciones", LoteAnotacionViewSet, basename="lote-anotaciones")

# compatibilidad: reportes -> anotaciones (solo lectura)
nested_reportes = NestedDefaultRouter(router, r"reportes", lookup="reporte")
nested_reportes.register(r"anotaciones", ReporteAnotacionProxyViewSet, basename="reporte-anotaciones")

urlpatterns = []
urlpatterns += router.urls
urlpatterns += nested_lotes.urls
urlpatterns += nested_reportes.urls
