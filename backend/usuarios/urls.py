from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, UsuarioActualAPIView, enviar_notificacion
from .views import enviar_notificacion
from .views import desactivar_usuario
from .views import activar_usuario

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    # Registrar rutas personalizadas primero
    path('usuarios/me/', UsuarioActualAPIView.as_view(), name='usuario-actual'),
    path("notificar/", enviar_notificacion),
    

    # Luego incluir las rutas generadas por el router
    path('', include(router.urls)),

    path('usuarios/<int:pk>/desactivar/', desactivar_usuario),
    path('usuarios/<int:pk>/activar/',   activar_usuario),
]

    


