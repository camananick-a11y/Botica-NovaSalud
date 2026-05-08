# 🚀 GUÍA RÁPIDA - INICIAR EL PROYECTO

## 📋 Requisitos Previos
- Python 3.13+ instalado
- Node.js y npm instalados
- Variables de entorno configuradas

---

## ✅ Estado Actual del Proyecto

### Backend (Django)
- ✅ Entorno virtual Python creado
- ✅ Dependencias instaladas (Django, DRF, Supabase, etc.)
- ✅ Proyecto Django configurado
- ✅ 4 aplicaciones creadas:
  - `auth_app` - Autenticación y gestión de usuarios/cargos
  - `medicamentos` - Gestión de medicamentos y categorías
  - `clientes` - Gestión de clientes
  - `ventas` - Gestión de ventas, comprobantes y detalles
- ✅ Modelos creados con relaciones correctas
- ✅ Migraciones aplicadas
- ✅ Superusuario creado (usuario: `admin`, contraseña: `admin123`)

### Frontend (React)
- ✅ Proyecto React creado con Vite
- ✅ Dependencias instaladas (React, Axios, React Router)
- ✅ Estructura base de carpetas lista

---

## 🔧 Credenciales de Acceso

### Admin Django
- **URL**: http://localhost:8000/admin
- **Usuario**: `admin`
- **Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambiar esta contraseña en producción

---

## 🚀 INICIAR EL BACKEND

### Opción 1: Terminal separada (Recomendado)

```powershell
# En PowerShell, navega a la carpeta backend
cd backend

# Activa el entorno virtual
.\venv\Scripts\Activate.ps1

# Inicia el servidor
python manage.py runserver

# El servidor estará en: http://localhost:8000
```

### Opción 2: Comando directo
```powershell
cd backend
.\venv\Scripts\Activate.ps1; python manage.py runserver
```

---

## 🚀 INICIAR EL FRONTEND

### En otra terminal

```powershell
# Navega a la carpeta frontend
cd frontend

# Instala dependencias (si no las tiene)
npm install

# Inicia el servidor de desarrollo
npm run dev

# El servidor estará en: http://localhost:5173
```

---

## 📊 Verificar que Todo Funciona

1. **Backend**
   - Abre: http://localhost:8000
   - Panel admin: http://localhost:8000/admin
   - API: http://localhost:8000/api/

2. **Frontend**
   - Abre: http://localhost:5173

---

## 📁 Estructura de Carpetas Importante

```
backend/
├── venv/                    # ← Entorno virtual (NO tocar)
├── botica_config/           # Configuración principal
├── auth_app/                # Aplicación de autenticación
├── medicamentos/            # Aplicación de medicamentos
├── clientes/                # Aplicación de clientes
├── ventas/                  # Aplicación de ventas
├── manage.py                # Comando principal de Django
├── db.sqlite3               # Base de datos (se crea al correr)
├── requirements.txt         # Dependencias Python
└── .env                     # Variables de entorno

frontend/
├── node_modules/            # ← Dependencias npm (NO tocar)
├── src/                     # Código fuente React
├── public/                  # Archivos estáticos
├── package.json             # Dependencias npm
├── vite.config.js          # Configuración de Vite
└── .env                     # Variables de entorno
```

---

## 🔗 Endpoints API (Por implementar)

### Autenticación (`/api/auth/`)
- `POST /login/` - Iniciar sesión
- `POST /logout/` - Cerrar sesión
- `GET /me/` - Obtener datos del usuario

### Medicamentos (`/api/medicamentos/`)
- `GET /` - Listar todos
- `POST /` - Crear
- `GET /{id}/` - Obtener uno
- `PUT /{id}/` - Actualizar
- `DELETE /{id}/` - Eliminar

### Clientes (`/api/clientes/`)
- `GET /` - Listar todos
- `POST /` - Crear
- `GET /{id}/` - Obtener uno
- `PUT /{id}/` - Actualizar
- `DELETE /{id}/` - Eliminar

### Ventas (`/api/ventas/`)
- `GET /` - Listar todas
- `POST /` - Crear
- `GET /{id}/` - Obtener una
- `PUT /{id}/` - Actualizar

---

## 🐛 Solución de Problemas

### Error: "No module named 'django'"
```powershell
# Asegúrate de estar en la carpeta backend y activar el venv
cd backend
.\venv\Scripts\Activate.ps1
```

### Puerto 8000 ya en uso
```powershell
python manage.py runserver 8001
```

### Puerto 5173 ya en uso
```powershell
npm run dev -- --port 5174
```

### Limpiar base de datos (⚠️ Cuidado - borra datos)
```powershell
# Elimina el archivo db.sqlite3 y vuelve a ejecutar
python manage.py migrate
python manage.py createsuperuser
```

---

## 📝 Próximos Pasos

1. ✅ **Backend configurado**
   - [ ] Crear serializers de DRF
   - [ ] Crear viewsets de DRF
   - [ ] Configurar URLs
   - [ ] Implementar autenticación JWT (opcional)

2. ✅ **Frontend configurado**
   - [ ] Crear componentes React
   - [ ] Configurar rutas
   - [ ] Integrar Axios
   - [ ] Crear páginas principales

3. **Testing**
   - [ ] Tests unitarios backend
   - [ ] Tests de API
   - [ ] Tests frontend

4. **Deployment**
   - [ ] Preparar para producción
   - [ ] Configurar variables de entorno
   - [ ] Deploy a servidor

---

## 💡 Tips Útiles

- Usa `python manage.py help` para ver todos los comandos disponibles
- Para debug de Django usa `python -m pdb manage.py runserver`
- En el navegador, abre las Developer Tools (F12) para ver errores de frontend
- Revisa los logs en la consola del terminal para errores

---

## 📞 Soporte

Para más información sobre:
- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Supabase**: https://supabase.com/docs

---

**Proyecto**: Botica Nova Salud  
**Fecha**: Abril 2026  
**Estado**: En Desarrollo ✓
