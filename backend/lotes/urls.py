from rest_framework.routers import DefaultRouter
from .views import LoteViewSet
from .views import SiembraViewSet

router = DefaultRouter()
router.register(r'lotes', LoteViewSet, basename='lote')
router.register(r'siembra', SiembraViewSet, basename='siembra')

urlpatterns = router.urls
