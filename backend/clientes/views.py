from rest_framework import viewsets
from .models import Cliente
from .serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar clientes"""
    queryset = Cliente.objects.filter(activo=True)
    serializer_class = ClienteSerializer
    filterset_fields = ['tipo_cliente', 'tipo_documento', 'ciudad', 'activo']
    search_fields = ['nombre', 'apellido', 'numero_documento', 'email', 'telefono']
    ordering_fields = ['nombre', 'apellido', 'created_at']

