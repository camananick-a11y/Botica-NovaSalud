from rest_framework import serializers
from .models import Comprobante, DetalleVenta
from medicamentos.models import StockMedicamento

class DetalleVentaSerializer(serializers.ModelSerializer):
    medicamento_nombre = serializers.CharField(source='id_medicamento.nombre', read_only=True)
    medicamento_presentacion = serializers.CharField(source='id_medicamento.id_presentacion.nombre', read_only=True, default='-')
    
    class Meta:
        model = DetalleVenta
        fields = ['id_detalle', 'id_medicamento', 'medicamento_nombre', 'medicamento_presentacion', 'cantidad', 'precio_unitario', 'subtotal']

class ComprobanteSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='id_cliente.nombre', read_only=True)
    cliente_tipo_documento = serializers.CharField(source='id_cliente.tipo_documento', read_only=True, default='-')
    cliente_numero_documento = serializers.CharField(source='id_cliente.numero_documento', read_only=True, default='-')
    cliente_direccion = serializers.CharField(source='id_cliente.direccion', read_only=True, default='-')
    usuario_nombre = serializers.CharField(source='id_usuario.nombre', read_only=True)
    usuario_usuario = serializers.CharField(source='id_usuario.usuario', read_only=True)
    
    class Meta:
        model = Comprobante
        fields = ['id_comprobante', 'serie', 'tipo', 'fecha', 'total', 
                  'id_cliente', 'cliente_nombre', 'cliente_tipo_documento', 'cliente_numero_documento', 'cliente_direccion',
                  'id_usuario', 'usuario_nombre', 'usuario_usuario', 'detalles']


class DetalleVentaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ['id_medicamento', 'cantidad', 'precio_unitario']

class ComprobanteCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Comprobante
        fields = ['id_comprobante', 'serie', 'tipo', 'fecha', 'total', 'id_cliente', 'detalles']
        read_only_fields = ['id_comprobante', 'total', 'fecha']
        
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        
        # Validar stock antes de empezar a crear nada
        for d in detalles_data:
            medicamento = d['id_medicamento']
            cantidad = d['cantidad']
            stock_obj = StockMedicamento.objects.filter(id_medicamento=medicamento).first()
            
            if not stock_obj or stock_obj.cantidad < cantidad:
                raise serializers.ValidationError(
                    f"Stock insuficiente para {medicamento.nombre}. Disponible: {stock_obj.cantidad if stock_obj else 0}"
                )
        
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
            
            # Deduct stock (ya validado arriba)
            stock_obj = StockMedicamento.objects.get(id_medicamento=medicamento)
            stock_obj.cantidad -= cantidad
            stock_obj.save()
                
        return comprobante
