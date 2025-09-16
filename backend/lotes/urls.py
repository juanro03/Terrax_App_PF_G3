from rest_framework.routers import DefaultRouter
from .views import LoteViewSet
from .views import SiembraViewSet
from .views import CosechaCreateView
from .views import FinalizarCampaniaView
from django.urls import path
from .views import HistorialPorLoteView
from .views import CoberturaViewSet
from .views import TrazabilidadView

router = DefaultRouter()
router.register(r'lotes', LoteViewSet, basename='lote')
router.register(r'siembras', SiembraViewSet, basename='siembra')
router.register(r'coberturas', CoberturaViewSet, basename='cobertura')


urlpatterns = router.urls + [
    path('cosechas/', CosechaCreateView.as_view(), name='crear-cosecha'),
    path('siembras/finalizar/<int:lote_id>/', FinalizarCampaniaView.as_view(), name='finalizar-campania'),
    path("trazabilidad/", TrazabilidadView.as_view(), name="trazabilidad"),
]
