from rest_framework.routers import DefaultRouter
from .views import LoteViewSet

router = DefaultRouter()
router.register(r'lotes', LoteViewSet, basename='lote')

urlpatterns = router.urls
