from rest_framework import viewsets
from tareas.models import Tarea
from .serializers import TareaSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny  # <-- agregar

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]  # <-- agregar
