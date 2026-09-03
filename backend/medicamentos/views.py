from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from auth_app.permissions import IsAlmacenero
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Prefetch
from django.utils import timezone
from .models import Laboratorio, Categoria, Presentacion, Unidad, Medicamento, StockMedicamento
from .serializers import (
    LaboratorioSerializer, CategoriaSerializer, PresentacionSerializer, 
    UnidadSerializer, MedicamentoSerializer, StockMedicamentoSerializer
)

class LaboratorioViewSet(viewsets.ModelViewSet):
    queryset = Laboratorio.objects.all()
    serializer_class = LaboratorioSerializer
    permission_classes = [IsAlmacenero]
    pagination_class = None

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAlmacenero]
    pagination_class = None

class PresentacionViewSet(viewsets.ModelViewSet):
    queryset = Presentacion.objects.all()
    serializer_class = PresentacionSerializer
    permission_classes = [IsAlmacenero]
    pagination_class = None

class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer
    permission_classes = [IsAlmacenero]
    pagination_class = None

class StockMedicamentoViewSet(viewsets.ModelViewSet):
    queryset = StockMedicamento.objects.all()
    serializer_class = StockMedicamentoSerializer
    permission_classes = [IsAlmacenero]
    filterset_fields = ['id_medicamento']

    @action(detail=False, methods=['post'])
    def ajustar(self, request):
        id_med = request.data.get('id_medicamento')
        nuevo_stock = request.data.get('nuevo_stock')
        if not id_med or nuevo_stock is None:
            return Response({'error': 'id_medicamento y nuevo_stock requeridos'}, status=400)
        stock, _ = StockMedicamento.objects.get_or_create(id_medicamento_id=id_med)
        stock.cantidad = int(nuevo_stock)
        stock.save()
        return Response({'id_medicamento': id_med, 'nuevo_stock': stock.cantidad})

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.select_related(
        'id_laboratorio', 'id_categoria', 'id_presentacion', 'id_unidad'
    ).prefetch_related(
        Prefetch('stockmedicamento_set', queryset=StockMedicamento.objects.all())
    ).all()
    serializer_class = MedicamentoSerializer
    search_fields = ['nombre']

    def list(self, request, *args, **kwargs):
        if request.query_params.get('all'):
            self.pagination_class = None
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAlmacenero()]
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        cantidad_inicial = data.pop('cantidad_inicial', 0)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Initialize stock
        StockMedicamento.objects.create(
            id_medicamento=serializer.instance,
            cantidad=cantidad_inicial
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        data = request.data.copy()
        stock_value = data.pop('stock', None)
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if stock_value is not None:
            StockMedicamento.objects.update_or_create(
                id_medicamento=instance,
                defaults={'cantidad': int(stock_value)}
            )

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        umbral = int(request.query_params.get('umbral', 10))
        stocks = StockMedicamento.objects.filter(cantidad__lt=umbral).select_related('id_medicamento')
        resultados = [
            {
                'id_medicamento': stock.id_medicamento.id_medicamento,
                'medicamento': stock.id_medicamento.nombre,
                'cantidad_actual': stock.cantidad
            }
            for stock in stocks
        ]
        return Response({
            'count': len(resultados),
            'results': resultados
        })
