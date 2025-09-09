from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampoViewSet
from .views import MisCamposView, SolicitarServicioView

router = DefaultRouter()
router.register(r'campos', CampoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('solicitar-servicio/', SolicitarServicioView.as_view(), name='solicitar_servicio'),
    path("mis-campos/", MisCamposView.as_view(), name="mis-campos"),
    ]