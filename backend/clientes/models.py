from django.db import models

class Cliente(models.Model):
    id_cliente = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=200)
    tipo_documento = models.CharField(max_length=20, blank=True, null=True)
    numero_documento = models.CharField(max_length=50, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(max_length=254, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cliente'
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self):
        return self.nombre
