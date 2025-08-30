# app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from reportes.views import ReporteViewSet, AnotacionViewSet

router = DefaultRouter()
router.register(r"reportes", ReporteViewSet, basename="reportes")

nested = NestedDefaultRouter(router, r"reportes", lookup="reporte")
nested.register(r"anotaciones", AnotacionViewSet, basename="reporte-anotaciones")

urlpatterns = router.urls + nested.urls
