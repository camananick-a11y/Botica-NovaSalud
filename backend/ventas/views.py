from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from datetime import datetime, timedelta
from .models import Venta, DetalleVenta, Comprobante
from .serializers import (
    VentaSerializer,
    VentaCreateSerializer,
    DetalleVentaSerializer,
    ComprobanteSerializer
)


class ComprobanteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar comprobantes"""
    queryset = Comprobante.objects.all()
    serializer_class = ComprobanteSerializer


class VentaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar ventas"""
    queryset = Venta.objects.all()
    filterset_fields = ['estado', 'metodo_pago', 'fecha_venta', 'cliente']
    search_fields = ['id', 'cliente__nombre', 'cliente__apellido']
    ordering_fields = ['fecha_venta', 'total', 'created_at']
    ordering = ['-fecha_venta']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VentaCreateSerializer
        return VentaSerializer
    
    @action(detail=False, methods=['get'])
    def resumen_hoy(self, request):
        """Resumen de ventas del día"""
        hoy = datetime.now().date()
        ventas_hoy = Venta.objects.filter(
            fecha_venta__date=hoy,
            estado='COMPLETADA'
        )
        
        return Response({
            'cantidad_ventas': ventas_hoy.count(),
            'total_ventas': ventas_hoy.aggregate(Sum('total'))['total__sum'] or 0,
            'total_por_metodo': list(
                ventas_hoy.values('metodo_pago').annotate(total=Sum('total'))
            )
        })
    
    @action(detail=False, methods=['get'])
    def por_fecha_rango(self, request):
        """Obtener ventas en un rango de fechas"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return Response(
                {'error': 'Proporciona fecha_inicio y fecha_fin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ventas = Venta.objects.filter(
            fecha_venta__date__gte=fecha_inicio,
            fecha_venta__date__lte=fecha_fin,
            estado='COMPLETADA'
        )
        
        serializer = VentaSerializer(ventas, many=True)
        return Response({
            'ventas': serializer.data,
            'total': ventas.aggregate(Sum('total'))['total__sum'] or 0,
            'cantidad': ventas.count()
        })
    
    @action(detail=False, methods=['get'])
    def por_cliente(self, request):
        """Historial de compras de un cliente"""
        cliente_id = request.query_params.get('cliente_id')
        
        if not cliente_id:
            return Response(
                {'error': 'Proporciona cliente_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ventas = Venta.objects.filter(cliente_id=cliente_id)
        serializer = VentaSerializer(ventas, many=True)
        return Response({
            'ventas': serializer.data,
            'total_gasto': ventas.aggregate(Sum('total'))['total__sum'] or 0,
            'cantidad_compras': ventas.count()
        })


class DetalleVentaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar detalles de ventas"""
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer
    filterset_fields = ['venta', 'medicamento']

