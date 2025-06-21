from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings
from usuarios.views import (
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
    CustomTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutas de autenticación usando email en lugar de username
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/password_reset/', PasswordResetRequestAPIView.as_view()),
    path('api/auth/password_reset/confirm/', PasswordResetConfirmAPIView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rutas de tus apps
    path('api/', include('usuarios.urls')),
    path('api/', include('campos.urls')),
    path('api/', include('lotes.urls')),
    path('api/auth/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),

] 

# Agrega soporte para archivos MEDIA en desarrollo
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
