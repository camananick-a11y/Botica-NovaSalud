import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'botica_config.settings')
django.setup()
from auth_app.models import Usuario
users = Usuario.objects.all()
print(f'Total users: {users.count()}')
for u in users:
    print(f'  id={u.id_usuario}, usuario={u.usuario}, nombre={u.nombre}, is_active={u.is_active}, password={u.password[:30]}...')
