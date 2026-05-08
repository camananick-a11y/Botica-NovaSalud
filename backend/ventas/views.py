from rest_framework import viewsets
from .models import Comprobante
from .serializers import ComprobanteSerializer, ComprobanteCreateSerializer

class ComprobanteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar comprobantes y ventas"""
    queryset = Comprobante.objects.all().order_by('-fecha')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ComprobanteCreateSerializer
        return ComprobanteSerializer
