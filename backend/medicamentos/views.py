from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Categoria, Medicamento
from .serializers import CategoriaSerializer, MedicamentoSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar categorías de medicamentos"""
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    search_fields = ['nombre']


class MedicamentoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar medicamentos"""
    queryset = Medicamento.objects.filter(activo=True)
    serializer_class = MedicamentoSerializer
    filterset_fields = ['categoria', 'activo', 'laboratorio']
    search_fields = ['nombre', 'codigo', 'principio_activo', 'laboratorio']
    ordering_fields = ['precio_venta', 'stock', 'created_at']
    
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        """Obtener medicamentos con stock bajo"""
        medicamentos = Medicamento.objects.filter(
            activo=True,
            stock__lte=models.F('stock_minimo')
        )
        serializer = self.get_serializer(medicamentos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vencidos(self, request):
        """Obtener medicamentos vencidos"""
        from datetime import date
        medicamentos = Medicamento.objects.filter(
            activo=True,
            fecha_vencimiento__lt=date.today()
        )
        serializer = self.get_serializer(medicamentos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def actualizar_stock(self, request, pk=None):
        """Actualizar stock de un medicamento"""
        medicamento = self.get_object()
        cantidad = request.data.get('cantidad', 0)
        
        try:
            cantidad = int(cantidad)
            medicamento.stock += cantidad
            medicamento.save()
            return Response({
                'success': True,
                'nuevo_stock': medicamento.stock,
                'mensaje': f'Stock actualizado a {medicamento.stock}'
            })
        except (ValueError, TypeError):
            return Response(
                {'error': 'Cantidad inválida'},
                status=status.HTTP_400_BAD_REQUEST
            )

