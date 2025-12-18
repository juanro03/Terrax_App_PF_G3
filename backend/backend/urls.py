from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from django.conf import settings

from usuarios.views import (
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
    CustomTokenObtainPairView,
    enviar_notificacion
)
from rest_framework_simplejwt.views import TokenRefreshView
from lotes.views import FinalizarCampaniaView
from . import views
from .views_cac import cac_pizarra


urlpatterns = [
    path("admin/", admin.site.urls),

    path("dashboard/", include("dashboard.urls")),

    # Auth
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/password_reset/", PasswordResetRequestAPIView.as_view()),
    path("api/auth/password_reset/confirm/", PasswordResetConfirmAPIView.as_view()),

    # APIs
    path("api/", include("usuarios.urls")),
    path("api/", include("campos.urls")),
    path("api/", include("lotes.urls")),
    path("api/", include("tareas.urls")),
    path("api/", include("productos.urls")),
    path("api/", include("reportes.urls")), 

    path('api/auth/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('siembras/finalizar/<int:lote_id>/', FinalizarCampaniaView.as_view(), name='finalizar-campania'),
    path("api/cac/pizarra/", cac_pizarra, name="cac_pizarra"),

    path("api/notificar/", enviar_notificacion),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
