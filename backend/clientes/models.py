from django.db import models

class Cliente(models.Model):
    """Modelo para los clientes"""
    nombre = models.CharField(max_length=200)
    apellido = models.CharField(max_length=200, blank=True)
    numero_documento = models.CharField(max_length=20, unique=True)
    tipo_documento = models.CharField(
        max_length=10,
        choices=[('DNI', 'DNI'), ('RUC', 'RUC'), ('PASAPORTE', 'Pasaporte')],
        default='DNI'
    )
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    direccion = models.TextField(blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    distrito = models.CharField(max_length=100, blank=True)
    referencia = models.TextField(blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    genero = models.CharField(
        max_length=10,
        choices=[('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro')],
        blank=True
    )
    tipo_cliente = models.CharField(
        max_length=20,
        choices=[('REGULAR', 'Regular'), ('VIP', 'VIP'), ('MAYORISTA', 'Mayorista')],
        default='REGULAR'
    )
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['nombre', 'apellido']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}".strip()

