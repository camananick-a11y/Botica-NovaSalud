# 📦 MIGRACIÓN DEL PROYECTO

## Lo que se ha hecho

Hemos reorganizado tu proyecto **Botica Nova Salud** desde una estructura simple (Express + EJS) a una arquitectura moderna profesional con **Backend Django + Frontend React**.

---

## 📊 Comparativa: Antes vs Después

### ANTES (Express + EJS)
```
Botica-NovaSalud/
├── app/
│   ├── app.js              ← Servidor Express
│   ├── config/
│   ├── routes/
│   ├── views/              ← Vistas EJS
│   └── public/
├── script_bd.sql
└── .env
```

### DESPUÉS (Django REST + React)
```
Botica-NovaSalud/
├── backend/                ← Django REST Framework
│   ├── venv/              ← Entorno virtual Python
│   ├── botica_config/     ← Configuración Django
│   ├── auth_app/          ← Autenticación
│   ├── medicamentos/      ← Módulo medicamentos
│   ├── clientes/          ← Módulo clientes
│   ├── ventas/            ← Módulo ventas
│   ├── manage.py
│   ├── db.sqlite3         ← Base de datos (se crea)
│   ├── requirements.txt   ← Dependencias Python
│   └── .env
├── frontend/              ← React + Vite
│   ├── src/
│   ├── public/
│   ├── node_modules/      ← Dependencias npm
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── app/                   ← CÓDIGO ANTIGUO (puede eliminarse)
├── .env                   ← Configuración compartida
├── README.md
├── README-NUEVO.md
├── INICIO_RAPIDO.md
└── start-project.ps1      ← Script para iniciar
```

---

## 🔄 Migración de Código

### Rutas Express → Endpoints REST

| Express (app/routes/) | Django REST Framework |
|-----|-----|
| `POST /login` | `POST /api/auth/login/` |
| `GET /medicamentos` | `GET /api/medicamentos/` |
| `POST /medicamentos` | `POST /api/medicamentos/` |
| `GET /clientes` | `GET /api/clientes/` |
| `POST /ventas` | `POST /api/ventas/` |

### Bases de Datos

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| **BD** | Supabase PostgreSQL | Supabase PostgreSQL (a través de Django ORM) |
| **ORM** | Supabase.js client | Django ORM + Supabase SDK |
| **Migraciones** | Manual (script_bd.sql) | Django migrations (automáticas) |

---

## 🎯 Ventajas de la Nueva Estructura

### ✅ Backend Django
- **Seguridad**: Protección CSRF, validación de datos automática
- **Escalabilidad**: Arquitectura modular por aplicaciones
- **Admin Panel**: Panel de administración automático
- **ORM**: Gestión de BD más segura y eficiente
- **API REST**: Django REST Framework estándar
- **Autenticación**: Sistema robusto de usuarios

### ✅ Frontend React
- **Componentes**: Interfaz modular y reutilizable
- **Performance**: Vite es mucho más rápido que webpack
- **SPA**: Aplicación de una sola página (Single Page Application)
- **Routing**: React Router para navegación fluida
- **Estado**: Fácil gestión de estado global

### ✅ Separación de Responsabilidades
- Backend enfocado en lógica y datos
- Frontend enfocado en UI/UX
- Comunicación vía APIs REST
- Fácil de testear, mantener y escalar

---

## 🗑️ Carpeta "app" Antigua

La carpeta `app/` contiene el código antiguo con Express.js.

### Opciones:

1. **Eliminarla** (Recomendado si ya no la necesitas)
   ```powershell
   Remove-Item app -Recurse -Force
   ```

2. **Guardarla como backup**
   ```powershell
   Move-Item app app.backup
   ```

3. **Dejarla mientras realizas la migración de código**
   - Útil para consultar la lógica antigua mientras la reescribes

---

## 📝 Código para Migrar Manualmente

### Ejemplo 1: Autenticación

#### Express (antiguo)
```javascript
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  // validar y autenticar
});
```

#### Django (nuevo)
```python
# En auth_app/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def login(request):
    username = request.data.get('usuario')
    password = request.data.get('password')
    # validar y autenticar
    return Response({'token': token})
```

#### React (nuevo)
```javascript
// En frontend/src/api/auth.js
import axios from 'axios';

export const login = async (usuario, password) => {
  const response = await axios.post('http://localhost:8000/api/auth/login/', {
    usuario,
    password
  });
  return response.data;
};
```

---

## 🚀 Pasos Siguientes

### 1. Crear Serializers (DRF)
Convierte modelos Django a JSON:

```python
# backend/auth_app/serializers.py
from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'cargo']
```

### 2. Crear ViewSets (DRF)
```python
# backend/auth_app/views.py
from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
```

### 3. Registrar URLs
```python
# backend/botica_config/urls.py
from rest_framework.routers import DefaultRouter
from auth_app.views import UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

### 4. Crear Componentes React
```jsx
// frontend/src/components/LoginForm.jsx
import { useState } from 'react';
import { login } from '../api/auth';

export default function LoginForm() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const data = await login(usuario, password);
      console.log('Login exitoso:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="text" 
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        placeholder="Usuario"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}
```

---

## 📚 Recursos Importantes

### Documentación
- [Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)

### Librerías Instaladas
**Backend**:
- Django 6.0.5
- djangorestframework 3.17.1
- django-cors-headers 4.9.0
- supabase 2.30.0
- python-dotenv 1.2.2

**Frontend**:
- react 18
- vite 5
- axios (HTTP client)
- react-router-dom (routing)

---

## ⚠️ Notas Importantes

1. **No olvides cambiar las contraseñas en producción**
   - Username: admin
   - Password: admin123 (CAMBIAR)

2. **Variables de entorno**
   - Cada carpeta (backend, frontend) tiene su propio `.env`
   - La raíz tiene un `.env` compartido para Supabase

3. **Base de datos**
   - Actual: SQLite (`db.sqlite3`)
   - Producción: Recomendado usar PostgreSQL en Supabase

4. **CORS**
   - Backend permite requests desde: localhost:3000, localhost:5173
   - Ajustar en `settings.py` si cambias puertos

---

## 🎓 Arquitectura del Proyecto

```
┌─────────────────────────────────────────┐
│           USUARIO (Navegador)           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │   FRONTEND (React)  │
        │   localhost:5173    │
        │  (Vite + Axios)     │
        └──────────┬──────────┘
                   │ HTTP/JSON
                   ▼
        ┌─────────────────────┐
        │  BACKEND (Django)   │
        │  localhost:8000     │
        │ (DRF + SQLite)      │
        └──────────┬──────────┘
                   │ ORM
                   ▼
        ┌─────────────────────┐
        │  BASE DE DATOS      │
        │  (SQLite/Supabase)  │
        └─────────────────────┘
```

---

## 📞 Ayuda

Si tienes problemas:

1. Revisa [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)
2. Mira la sección "Solución de Problemas"
3. Revisa los logs en la terminal
4. Abre las Developer Tools (F12) en el navegador

---

**Proyecto**: Botica Nova Salud  
**Versión**: 2.0 (Django + React)  
**Fecha de Migración**: Abril 2026  
**Estado**: ✅ Listo para desarrollo
