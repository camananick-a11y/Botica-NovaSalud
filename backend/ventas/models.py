from django.db import models
from django.contrib.auth import get_user_model
from medicamentos.models import Medicamento
from clientes.models import Cliente

User = get_user_model()


class Comprobante(models.Model):
    """Tipos de comprobantes"""
    TIPOS = [
        ('BOLETA', 'Boleta'),
        ('FACTURA', 'Factura'),
        ('NOTA', 'Nota de Venta'),
    ]
    
    tipo = models.CharField(max_length=20, choices=TIPOS)
    serie = models.CharField(max_length=10)
    numero = models.IntegerField()
    
    class Meta:
        verbose_name = "Comprobante"
        verbose_name_plural = "Comprobantes"
        unique_together = ('serie', 'numero')
    
    def __str__(self):
        return f"{self.get_tipo_display()} {self.serie}-{self.numero:06d}"


class Venta(models.Model):
    """Modelo para registrar ventas"""
    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADA', 'Completada'),
        ('CANCELADA', 'Cancelada'),
    ]
    
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    usuario = models.ForeignKey(User, on_delete=models.PROTECT)
    comprobante = models.ForeignKey(Comprobante, on_delete=models.PROTECT)
    
    fecha_venta = models.DateTimeField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    descuento = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    igv = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    
    metodo_pago = models.CharField(
        max_length=20,
        choices=[('EFECTIVO', 'Efectivo'), ('TARJETA', 'Tarjeta'), ('TRANSFERENCIA', 'Transferencia')],
        default='EFECTIVO'
    )
    estado = models.CharField(max_length=20, choices=ESTADOS, default='COMPLETADA')
    observaciones = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ['-fecha_venta']
    
    def __str__(self):
        return f"Venta #{self.id} - {self.cliente} - {self.total}"


class DetalleVenta(models.Model):
    """Detalles de los medicamentos en cada venta"""
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    medicamento = models.ForeignKey(Medicamento, on_delete=models.PROTECT)
    
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Detalle Venta"
        verbose_name_plural = "Detalles Venta"
    
    def __str__(self):
        return f"{self.medicamento} x {self.cantidad}"

