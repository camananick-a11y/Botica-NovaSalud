from django.db import models
from clientes.models import Cliente
from auth_app.models import Usuario
from medicamentos.models import Medicamento

class Comprobante(models.Model):
    id_comprobante = models.BigAutoField(primary_key=True)
    serie = models.CharField(max_length=20)
    tipo = models.CharField(max_length=20)
    fecha = models.DateTimeField(auto_now_add=True, db_column='Fecha', db_index=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    igv = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, default='efectivo')
    id_cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, db_column='id_cliente')
    id_usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, db_column='id_usuario')

    class Meta:
        db_table = 'comprobante'
        indexes = [
            models.Index(fields=['id_cliente']),
            models.Index(fields=['id_usuario']),
        ]

    def __str__(self):
        return f"{self.tipo} {self.serie} - {self.total}"


class DetalleVenta(models.Model):
    id_detalle = models.BigAutoField(primary_key=True)
    id_comprobante = models.ForeignKey(Comprobante, on_delete=models.CASCADE, db_column='id_comprobante', related_name='detalles')
    id_medicamento = models.ForeignKey(Medicamento, on_delete=models.PROTECT, db_column='id_medicamento')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'detalle_venta'
        indexes = [
            models.Index(fields=['id_medicamento']),
            models.Index(fields=['id_comprobante']),
        ]

    def __str__(self):
        return f"{self.id_medicamento.nombre} x {self.cantidad}"
