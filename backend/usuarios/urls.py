from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet
from .views import enviar_notificacion
from .views import desactivar_usuario
from .views import activar_usuario

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('usuarios/<int:pk>/desactivar/', desactivar_usuario),
    path('usuarios/<int:pk>/activar/',   activar_usuario),
    path('notificar/', enviar_notificacion),
]
