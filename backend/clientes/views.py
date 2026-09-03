from rest_framework import viewsets
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from auth_app.permissions import IsVendedor
from .models import Cliente
from .serializers import ClienteSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar clientes"""
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    search_fields = ['nombre', 'numero_documento']

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsVendedor()]
