from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampoViewSet

router = DefaultRouter()
router.register(r'campos', CampoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
