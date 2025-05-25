from rest_framework import viewsets
from .models import Campo
from .serializers import CampoSerializer
from rest_framework.permissions import IsAuthenticated


class CampoViewSet(viewsets.ModelViewSet):
    queryset = Campo.objects.all()
    serializer_class = CampoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.rol == 'admin':
            return Campo.objects.all()
        return Campo.objects.filter(propietario=user)

    def perform_create(self, serializer):
        serializer.save(propietario=self.request.user)

    def update(self, request, *args, **kwargs):
        campo = self.get_object()
        if request.user.rol == 'productor' and campo.propietario != request.user:
            return Response({"detail": "No tiene permiso para editar este campo."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        campo = self.get_object()
        if request.user.rol == 'productor' and campo.propietario != request.user:
            return Response({"detail": "No tiene permiso para eliminar este campo."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
