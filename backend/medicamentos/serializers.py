from rest_framework import serializers
from .models import Laboratorio, Categoria, Presentacion, Unidad, Medicamento, StockMedicamento

class LaboratorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Laboratorio
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class PresentacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presentacion
        fields = '__all__'

class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = '__all__'

class StockMedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMedicamento
        fields = ['id_stock', 'id_medicamento', 'cantidad']

class MedicamentoSerializer(serializers.ModelSerializer):
    laboratorio_nombre = serializers.CharField(source='id_laboratorio.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='id_categoria.nombre', read_only=True)
    presentacion_nombre = serializers.CharField(source='id_presentacion.nombre', read_only=True)
    unidad_nombre = serializers.CharField(source='id_unidad.nombre', read_only=True)
    
    # Nested stock info for convenience
    stock = serializers.SerializerMethodField()

    class Meta:
        model = Medicamento
        fields = ['id_medicamento', 'nombre', 'precio', 
                  'id_laboratorio', 'laboratorio_nombre',
                  'id_categoria', 'categoria_nombre',
                  'id_presentacion', 'presentacion_nombre',
                  'id_unidad', 'unidad_nombre', 'stock', 'imagen_url']
        
    def get_stock(self, obj):
        stock_obj = StockMedicamento.objects.filter(id_medicamento=obj).first()
        return stock_obj.cantidad if stock_obj else 0
