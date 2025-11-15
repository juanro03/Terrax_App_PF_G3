from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CampaniaViewSet,
    LoteViewSet,
    SiembraViewSet,
    CosechaViewSet,       
    CoberturaViewSet,
    FinalizarCampaniaView,
    HistorialPorLoteView,
    TrazabilidadView,
)

router = DefaultRouter()
router.register(r"lotes", LoteViewSet, basename="lote")
router.register(r"siembras", SiembraViewSet, basename="siembra")
router.register(r"cosechas", CosechaViewSet, basename="cosecha") 
router.register(r"coberturas", CoberturaViewSet, basename="cobertura")
router.register(r"campanias", CampaniaViewSet, basename="campania") 

urlpatterns = [
    path("campanias/finalizar/<int:lote_id>/", FinalizarCampaniaView.as_view(), name="finalizar-campania"),
    path("campanias/por-lote/<int:lote_id>/", HistorialPorLoteView.as_view(), name="historial-por-lote"),
    path("trazabilidad/", TrazabilidadView.as_view(), name="trazabilidad"),
]

urlpatterns += router.urls
