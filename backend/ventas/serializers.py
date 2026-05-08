from rest_framework import serializers
from .models import Comprobante, Venta, DetalleVenta
from medicamentos.models import Medicamento
from clientes.models import Cliente
from django.contrib.auth import get_user_model

User = get_user_model()


class ComprobanteSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Comprobante
        fields = ['id', 'tipo', 'tipo_display', 'serie', 'numero']


class DetalleVentaSerializer(serializers.ModelSerializer):
    medicamento_nombre = serializers.CharField(source='medicamento.nombre', read_only=True)
    medicamento_codigo = serializers.CharField(source='medicamento.codigo', read_only=True)
    
    class Meta:
        model = DetalleVenta
        fields = ['id', 'venta', 'medicamento', 'medicamento_nombre', 
                  'medicamento_codigo', 'cantidad', 'precio_unitario', 'subtotal']
        read_only_fields = ['subtotal']
    
    def create(self, validated_data):
        """Calcula automáticamente el subtotal"""
        detalle = DetalleVenta(**validated_data)
        detalle.subtotal = detalle.cantidad * detalle.precio_unitario
        detalle.save()
        return detalle


class DetalleVentaCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear detalles de venta (acepta medicamento_id)"""
    medicamento_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DetalleVenta
        fields = ['medicamento_id', 'cantidad', 'precio_unitario']


class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    comprobante_display = serializers.CharField(source='comprobante.__str__', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    metodo_pago_display = serializers.CharField(source='get_metodo_pago_display', read_only=True)
    
    class Meta:
        model = Venta
        fields = ['id', 'cliente', 'cliente_nombre', 'usuario', 'usuario_nombre',
                  'comprobante', 'comprobante_display', 'fecha_venta', 'subtotal',
                  'descuento', 'igv', 'total', 'metodo_pago', 'metodo_pago_display',
                  'estado', 'estado_display', 'observaciones', 'detalles', 
                  'created_at', 'updated_at']
        read_only_fields = ['subtotal', 'igv', 'total', 'fecha_venta', 'created_at', 'updated_at']


class VentaCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Venta
        fields = ['cliente', 'usuario', 'comprobante', 'descuento', 'metodo_pago',
                  'estado', 'observaciones', 'detalles']
    
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        
        # Crear la venta
        venta = Venta.objects.create(**validated_data)
        
        # Crear detalles y calcular totales
        subtotal = 0
        for detalle_data in detalles_data:
            medicamento = Medicamento.objects.get(id=detalle_data['medicamento_id'])
            detalle = DetalleVenta.objects.create(
                venta=venta,
                medicamento=medicamento,
                cantidad=detalle_data['cantidad'],
                precio_unitario=detalle_data['precio_unitario'],
                subtotal=detalle_data['cantidad'] * detalle_data['precio_unitario']
            )
            subtotal += detalle.subtotal
        
        # Actualizar totales de la venta
        venta.subtotal = subtotal
        venta.igv = subtotal * 0.18  # IGV Perú: 18%
        venta.total = subtotal - venta.descuento + venta.igv
        venta.save()
        
        return venta
