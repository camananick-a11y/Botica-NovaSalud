from django.db import models

class Categoria(models.Model):
    """Categorías de medicamentos"""
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
    
    def __str__(self):
        return self.nombre


class Medicamento(models.Model):
    """Modelo para los medicamentos"""
    nombre = models.CharField(max_length=200)
    codigo = models.CharField(max_length=50, unique=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    principio_activo = models.CharField(max_length=200, blank=True)
    concentracion = models.CharField(max_length=50, blank=True)
    unidad_medida = models.CharField(max_length=20, default="mg")
    precio_costo = models.DecimalField(max_digits=10, decimal_places=2)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=10)
    lote = models.CharField(max_length=50, blank=True)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    laboratorio = models.CharField(max_length=150, blank=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Medicamento"
        verbose_name_plural = "Medicamentos"
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} ({self.codigo})"

