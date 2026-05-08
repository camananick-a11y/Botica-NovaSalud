from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Cargo(models.Model):
    id_cargo = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=100)

    class Meta:
        db_table = 'cargo'
        verbose_name = "Cargo"
        verbose_name_plural = "Cargos"

    def __str__(self):
        return self.nombre


class UsuarioManager(BaseUserManager):
    def create_user(self, usuario, nombre, password=None, **extra_fields):
        if not usuario:
            raise ValueError('El usuario debe tener un nombre de usuario')
        user = self.model(usuario=usuario, nombre=nombre, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, usuario, nombre, password=None, **extra_fields):
        # Asignar a un cargo de administrador por defecto si es superuser
        cargo, _ = Cargo.objects.get_or_create(nombre='Administrador')
        extra_fields.setdefault('id_cargo', cargo)
        return self.create_user(usuario, nombre, password, **extra_fields)


class Usuario(AbstractBaseUser):
    id_usuario = models.BigAutoField(primary_key=True, db_column='id')
    usuario = models.CharField(max_length=150, unique=True)
    nombre = models.CharField(max_length=200)
    id_cargo = models.ForeignKey(Cargo, on_delete=models.PROTECT, db_column='id_cargo')

    objects = UsuarioManager()

    USERNAME_FIELD = 'usuario'
    REQUIRED_FIELDS = ['nombre']

    class Meta:
        db_table = 'usuario'
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.nombre

    @property
    def is_anonymous(self):
        return False
        
    @property
    def is_authenticated(self):
        return True
