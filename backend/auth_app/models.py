from django.db import models
from django.contrib.auth.models import AbstractUser

class Cargo(models.Model):
    """Modelo para los cargos de los empleados"""
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Cargo"
        verbose_name_plural = "Cargos"
    
    def __str__(self):
        return self.nombre


class Usuario(AbstractUser):
    """Modelo personalizado de usuario extendiendo AbstractUser"""
    cargo = models.ForeignKey(Cargo, on_delete=models.PROTECT, null=True, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
