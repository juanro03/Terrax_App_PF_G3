# app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReporteViewSet

router = DefaultRouter()
router.register(r'reportes', ReporteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
