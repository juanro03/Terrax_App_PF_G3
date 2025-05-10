from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from dj_rest_auth.jwt_auth import get_refresh_view

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutas de autenticación
    path('api/auth/', include('dj_rest_auth.urls')),  # Login, logout, password reset, etc.
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  # Registro de usuarios
    path('api/auth/token/refresh/', get_refresh_view().as_view(), name='token_refresh'),

    # Rutas de tus apps
    path('api/', include('usuarios.urls')),
    path('api/', include('campos.urls')),
    # Podés agregar más aquí: lotes, tareas, etc.
]

# Agrega soporte para archivos MEDIA en desarrollo
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


    