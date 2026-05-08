from rest_framework import viewsets, status
from auth_app.permissions import IsAlmacenero
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Laboratorio, Categoria, Presentacion, Unidad, Medicamento, StockMedicamento
from .serializers import (
    LaboratorioSerializer, CategoriaSerializer, PresentacionSerializer, 
    UnidadSerializer, MedicamentoSerializer, StockMedicamentoSerializer
)

class LaboratorioViewSet(viewsets.ModelViewSet):
    queryset = Laboratorio.objects.all()
    serializer_class = LaboratorioSerializer
    permission_classes = [IsAlmacenero]

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAlmacenero]

class PresentacionViewSet(viewsets.ModelViewSet):
    queryset = Presentacion.objects.all()
    serializer_class = PresentacionSerializer
    permission_classes = [IsAlmacenero]

class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer
    permission_classes = [IsAlmacenero]

class StockMedicamentoViewSet(viewsets.ModelViewSet):
    queryset = StockMedicamento.objects.all()
    serializer_class = StockMedicamentoSerializer
    permission_classes = [IsAlmacenero]
    filterset_fields = ['id_medicamento']

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [IsAlmacenero]
    search_fields = ['nombre']
    
    def create(self, request, *args, **kwargs):
        cantidad_inicial = request.data.pop('cantidad_inicial', 0)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Initialize stock
        StockMedicamento.objects.create(
            id_medicamento=serializer.instance,
            cantidad=cantidad_inicial
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
