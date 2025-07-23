from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, UsuarioActualAPIView, enviar_notificacion

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    # Registrar rutas personalizadas primero
    path('usuarios/me/', UsuarioActualAPIView.as_view(), name='usuario-actual'),
    path("notificar/", enviar_notificacion),

    # Luego incluir las rutas generadas por el router
    path('', include(router.urls)),
]