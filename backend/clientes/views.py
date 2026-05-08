from rest_framework import viewsets
from auth_app.permissions import IsVendedor
from .models import Cliente
from .serializers import ClienteSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar clientes"""
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsVendedor]
    search_fields = ['nombre', 'numero_documento']

