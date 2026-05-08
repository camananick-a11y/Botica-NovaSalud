# 🚀 GUÍA RÁPIDA - BOTICA NOVASALUD

## ✅ Estado del Backend: 100% Sincronizado
El sistema ya está conectado a Supabase y tiene toda la lógica de negocio activa.

---

## 🔧 Credenciales de Prueba (Roles Activos)

| Usuario | Password | Rol | Permisos |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | Administrador | Acceso Total |
| `vendedor1` | `vendedor123` | Vendedor | Clientes y Ventas |
| `almacen1` | `almacen123` | Almacenero | Inventario y Stock |
| `supervisor1` | `super123` | Supervisor | Reportes de Ventas |

## 🛡️ Seguridad y Autenticación (JWT)
El sistema utiliza tokens JWT para la seguridad. Por defecto:
- **Access Token**: 12 horas (configurable en `.env` vía `ACCESS_TOKEN_LIFETIME_MINUTES`).
- **Refresh Token**: 7 días (configurable en `.env` vía `REFRESH_TOKEN_LIFETIME_DAYS`).

---

## 🚀 CÓMO INICIAR EL SISTEMA

1. **Vía Script (Recomendado)**:
   Ejecuta el archivo `start-project.ps1` en la raíz. Abrirá dos terminales con todo listo.

2. **Vía Manual**:
   - Backend: `cd backend; .\venv\Scripts\Activate.ps1; python manage.py runserver`
   - Frontend: `cd frontend; npm run dev`

---

## 🛡️ Características de Seguridad Implementadas
- **JWT Auth**: Login seguro con tokens que expiran.
- **Auto-User**: El backend sabe qué usuario hace la venta por su token.
- **Auto-Stock**: Al crear una venta, el stock disminuye automáticamente en Supabase.
- **Validación**: No se puede vender un producto si el stock es menor a la cantidad solicitada.
- **Passwords**: Encriptados con PBKDF2 (SHA256).

---

## 📂 Documentación Adicional
- **Pruebas en Postman**: Ver [endpoints_test.md](./endpoints_test.md).
- **Esquema BD**: Ver [README.md](./README.md).
- **Progreso**: Ver [CHECKLIST.md](./CHECKLIST.md).

---

**Proyecto**: Botica Nova Salud  
**Última Sincronización**: Mayo 2026  
