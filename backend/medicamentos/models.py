from django.db import models

class Laboratorio(models.Model):
    id_laboratorio = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'laboratorio'

    def __str__(self):
        return self.nombre


class Categoria(models.Model):
    id_categoria = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categoria'

    def __str__(self):
        return self.nombre


class Presentacion(models.Model):
    id_presentacion = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'presentacion'

    def __str__(self):
        return self.nombre


class Unidad(models.Model):
    id_unidad = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'unidad'

    def __str__(self):
        return self.nombre


class Medicamento(models.Model):
    id_medicamento = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    id_laboratorio = models.ForeignKey(Laboratorio, on_delete=models.PROTECT, db_column='id_laboratorio')
    id_categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, db_column='id_categoria')
    id_presentacion = models.ForeignKey(Presentacion, on_delete=models.PROTECT, db_column='id_presentacion')
    id_unidad = models.ForeignKey(Unidad, on_delete=models.PROTECT, db_column='id_unidad')
    imagen_url = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'medicamento'

    def __str__(self):
        return self.nombre


class StockMedicamento(models.Model):
    id_stock = models.BigAutoField(primary_key=True)
    id_medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE, db_column='id_medicamento')
    cantidad = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_medicamento'

    def __str__(self):
        return f"{self.id_medicamento.nombre} - Stock: {self.cantidad}"
