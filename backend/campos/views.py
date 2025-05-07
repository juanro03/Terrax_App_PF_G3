from rest_framework import viewsets
from .models import Campo
from .serializers import CampoSerializer

class CampoViewSet(viewsets.ModelViewSet):
    queryset = Campo.objects.all()
    serializer_class = CampoSerializer




# Create your views here.
