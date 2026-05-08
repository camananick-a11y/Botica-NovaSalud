from rest_framework import serializers
from .models import Categoria, Medicamento


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'created_at']
        read_only_fields = ['created_at']


class MedicamentoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    ganancia = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicamento
        fields = ['id', 'nombre', 'codigo', 'categoria', 'categoria_nombre', 
                  'principio_activo', 'concentracion', 'unidad_medida', 
                  'precio_costo', 'precio_venta', 'ganancia', 'stock', 
                  'stock_minimo', 'lote', 'fecha_vencimiento', 'laboratorio', 
                  'descripcion', 'activo', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_ganancia(self, obj):
        """Calcula la ganancia por medicamento"""
        return float(obj.precio_venta - obj.precio_costo)
