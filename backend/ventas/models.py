from django.db import models
from clientes.models import Cliente
from auth_app.models import Usuario
from medicamentos.models import Medicamento

class Comprobante(models.Model):
    id_comprobante = models.BigAutoField(primary_key=True)
    serie = models.CharField(max_length=20)
    tipo = models.CharField(max_length=20)
    fecha = models.DateTimeField(auto_now_add=True, db_column='Fecha')
    total = models.DecimalField(max_digits=12, decimal_places=2)
    id_cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, db_column='id_cliente')
    id_usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, db_column='id_usuario')

    class Meta:
        db_table = 'comprobante'

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

    def __str__(self):
        return f"{self.id_medicamento.nombre} x {self.cantidad}"
