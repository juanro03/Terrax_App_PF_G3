from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, UsuarioActualAPIView, enviar_notificacion
from .views import enviar_notificacion
from .views import desactivar_usuario
from .views import activar_usuario
from django.urls import path
from .views import listar_notificaciones_mora
from .views import eliminar_notificaciones_mora

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    # Registrar rutas personalizadas primero
    path('usuarios/me/', UsuarioActualAPIView.as_view(), name='usuario-actual'),
    path("notificar/", enviar_notificacion),
    path("notificaciones-mora/", listar_notificaciones_mora),
    path("notificaciones-mora/eliminar/", eliminar_notificaciones_mora),
    

    # Luego incluir las rutas generadas por el router
    path('', include(router.urls)),

    path('usuarios/<int:pk>/desactivar/', desactivar_usuario),
    path('usuarios/<int:pk>/activar/',   activar_usuario),
]



    


