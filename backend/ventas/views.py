from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from auth_app.permissions import IsSupervisor, IsVendedorOrSupervisor
from django.db.models import Sum, Count, Prefetch
from django.db.models.functions import TruncMonth
from .models import Comprobante, DetalleVenta
from .serializers import ComprobanteSerializer, ComprobanteCreateSerializer
from medicamentos.models import StockMedicamento

class ComprobanteViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar comprobantes y ventas"""
    queryset = Comprobante.objects.select_related(
        'id_cliente', 'id_usuario'
    ).prefetch_related(
        Prefetch('detalles', queryset=DetalleVenta.objects.select_related('id_medicamento__id_presentacion'))
    ).all().order_by('-fecha')
    
    def get_queryset(self):
        qs = super().get_queryset()
        inicio = self.request.query_params.get('inicio')
        fin = self.request.query_params.get('fin')
        if inicio:
            qs = qs.filter(fecha__gte=inicio)
        if fin:
            qs = qs.filter(fecha__lte=fin)
        return qs

    def list(self, request, *args, **kwargs):
        if request.query_params.get('all'):
            self.pagination_class = None
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        if self.action in ['reporte_ventas_fecha', 'medicamentos_mas_vendidos', 'clientes_mas_frecuentes', 'ventas_por_mes']:
            return [IsSupervisor()]
        if self.action == 'stock_bajo':
            return [IsAuthenticated()]
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsVendedorOrSupervisor()]
    
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
        qs = DetalleVenta.objects
        inicio = request.query_params.get('inicio')
        fin = request.query_params.get('fin')
        if inicio:
            qs = qs.filter(id_comprobante__fecha__gte=inicio)
        if fin:
            qs = qs.filter(id_comprobante__fecha__lte=fin)
        detalles = qs.values('id_medicamento__nombre').annotate(
            total_vendido=Sum('cantidad')
        ).order_by('-total_vendido')[:10]
        return Response(detalles)

    @action(detail=False, methods=['get'])
    def todos_vendidos(self, request):
        qs = DetalleVenta.objects
        inicio = request.query_params.get('inicio')
        fin = request.query_params.get('fin')
        if inicio:
            qs = qs.filter(id_comprobante__fecha__gte=inicio)
        if fin:
            qs = qs.filter(id_comprobante__fecha__lte=fin)
        detalles = qs.values(
            'id_medicamento',
            'id_medicamento__nombre',
            'id_medicamento__imagen_url',
            'id_medicamento__id_presentacion__nombre'
        ).annotate(
            total_vendido=Sum('cantidad'),
            total_recaudado=Sum('subtotal')
        ).order_by('-total_vendido')
        return Response(detalles)
        
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        umbral = request.query_params.get('umbral', 10)
        stocks = StockMedicamento.objects.filter(cantidad__lt=umbral).select_related('id_medicamento')
        resultados = [
            {
                'id_medicamento': stock.id_medicamento.id_medicamento,
                'medicamento': stock.id_medicamento.nombre,
                'imagen_url': stock.id_medicamento.imagen_url,
                'cantidad_actual': stock.cantidad,
            }
            for stock in stocks
        ]
        return Response(resultados)

    @action(detail=False, methods=['get'])
    def ventas_por_mes(self, request):
        ventas = (
            Comprobante.objects
            .annotate(mes=TruncMonth('fecha'))
            .values('mes')
            .annotate(total=Sum('total'))
            .order_by('mes')
        )
        return Response(list(ventas))

    @action(detail=False, methods=['get'])
    def clientes_mas_frecuentes(self, request):
        qs = Comprobante.objects
        inicio = request.query_params.get('inicio')
        fin = request.query_params.get('fin')
        if inicio:
            qs = qs.filter(fecha__gte=inicio)
        if fin:
            qs = qs.filter(fecha__lte=fin)
        clientes = (
            qs.values('id_cliente__nombre')
            .annotate(
                total_compras=Count('id_comprobante'),
                total_gastado=Sum('total')
            )
            .order_by('-total_gastado')[:10]
        )
        return Response(clientes)

    @action(detail=False, methods=['get'])
    def exportar(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

