import os
import django
import sys

# Configurar el entorno de Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'botica_config.settings')
django.setup()

from auth_app.models import Cargo, Usuario

def crear_usuario(username, passw, nombre_cargo):
    cargo, _ = Cargo.objects.get_or_create(nombre=nombre_cargo)
    if not Usuario.objects.filter(usuario=username).exists():
        u = Usuario(usuario=username, nombre=f"Test {nombre_cargo}", id_cargo=cargo)
        u.set_password(passw)
        u.save()
        print("Usuario '{}' creado con rol '{}'".format(username, nombre_cargo))
    else:
        print("Usuario '{}' ya existe".format(username))

# Crear roles de prueba para validar seguridad
crear_usuario('vendedor1', 'vendedor123', 'Vendedor')
crear_usuario('almacen1', 'almacen123', 'Almacenero')
crear_usuario('supervisor1', 'super123', 'Supervisor')

print("\n🚀 SCRIPTS DE PRUEBA LISTOS")
