from rest_framework import serializers
from .models import Comprobante, DetalleVenta
from medicamentos.models import StockMedicamento

class DetalleVentaSerializer(serializers.ModelSerializer):
    medicamento_nombre = serializers.CharField(source='id_medicamento.nombre', read_only=True)
    
    class Meta:
        model = DetalleVenta
        fields = ['id_detalle', 'id_medicamento', 'medicamento_nombre', 'cantidad', 'precio_unitario', 'subtotal']

class ComprobanteSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='id_cliente.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='id_usuario.nombre', read_only=True)
    
    class Meta:
        model = Comprobante
        fields = ['id_comprobante', 'serie', 'tipo', 'fecha', 'total', 
                  'id_cliente', 'cliente_nombre', 'id_usuario', 'usuario_nombre', 'detalles']


class DetalleVentaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ['id_medicamento', 'cantidad', 'precio_unitario']

class ComprobanteCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Comprobante
        fields = ['serie', 'tipo', 'id_cliente', 'id_usuario', 'detalles']
        
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        
        # Calculate total
        total = sum(d['cantidad'] * d['precio_unitario'] for d in detalles_data)
        validated_data['total'] = total
        
        # Create Comprobante
        comprobante = Comprobante.objects.create(**validated_data)
        
        # Create Detalles and deduct stock
        for detalle_data in detalles_data:
            medicamento = detalle_data['id_medicamento']
            cantidad = detalle_data['cantidad']
            
            DetalleVenta.objects.create(
                id_comprobante=comprobante,
                id_medicamento=medicamento,
                cantidad=cantidad,
                precio_unitario=detalle_data['precio_unitario'],
                subtotal=cantidad * detalle_data['precio_unitario']
            )
            
            # Deduct stock
            stock_obj = StockMedicamento.objects.filter(id_medicamento=medicamento).first()
            if stock_obj:
                stock_obj.cantidad -= cantidad
                stock_obj.save()
                
        return comprobante
