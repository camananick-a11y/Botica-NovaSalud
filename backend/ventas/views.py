from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from auth_app.permissions import IsVendedor, IsSupervisor
from django.db.models import Sum
from .models import Comprobante, DetalleVenta
from .serializers import ComprobanteSerializer, ComprobanteCreateSerializer
from medicamentos.models import StockMedicamento, Medicamento
from datetime import datetime, timedelta

class ComprobanteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar comprobantes y ventas"""
    queryset = Comprobante.objects.all().order_by('-fecha')
    
    def get_permissions(self):
        if self.action in ['reporte_ventas_fecha', 'medicamentos_mas_vendidos', 'stock_bajo']:
            return [IsSupervisor()]
        return [IsVendedor()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ComprobanteCreateSerializer
        return ComprobanteSerializer

    def perform_create(self, serializer):
        # Asignar automáticamente el usuario autenticado
        serializer.save(id_usuario=self.request.user)

    @action(detail=False, methods=['get'])
    def reporte_ventas_fecha(self, request):
        inicio = request.query_params.get('inicio')
        fin = request.query_params.get('fin')
        
        queryset = self.get_queryset()
        if inicio:
            queryset = queryset.filter(fecha__gte=inicio)
        if fin:
            queryset = queryset.filter(fecha__lte=fin)
            
        serializer = ComprobanteSerializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def medicamentos_mas_vendidos(self, request):
        detalles = DetalleVenta.objects.values('id_medicamento__nombre').annotate(
            total_vendido=Sum('cantidad')
        ).order_by('-total_vendido')[:10]
        return Response(detalles)
        
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        umbral = request.query_params.get('umbral', 10)
        stocks = StockMedicamento.objects.filter(cantidad__lt=umbral).select_related('id_medicamento')
        resultados = [
            {
                'medicamento': stock.id_medicamento.nombre,
                'cantidad_actual': stock.cantidad
            }
            for stock in stocks
        ]
        return Response(resultados)

