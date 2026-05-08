# ✅ CHECKLIST DE DESARROLLO - Botica Nova Salud

## 📋 FASE 1: CONFIGURACIÓN BASE ✅ COMPLETADA

### Backend Django
- [x] Crear entorno virtual Python
- [x] Instalar Django y dependencias
- [x] Crear proyecto Django (`botica_config`)
- [x] Crear 4 aplicaciones (auth_app, medicamentos, clientes, ventas)
- [x] Configurar Django para variables de entorno (.env)
- [x] Crear modelos de datos:
  - [x] `Usuario` con modelo personalizado
  - [x] `Cargo` para empleados
  - [x] `Medicamento` y `Categoria`
  - [x] `Cliente` con tipos y datos completos
  - [x] `Venta`, `Comprobante` y `DetalleVenta`
- [x] Crear archivos admin.py para cada app
- [x] Ejecutar migraciones
- [x] Crear superusuario (admin:admin123)
- [x] Configurar CORS para frontend

### Frontend React
- [x] Crear proyecto React con Vite
- [x] Instalar dependencias:
  - [x] axios (HTTP client)
  - [x] react-router-dom (enrutamiento)
- [x] Configurar archivo .env para API

### Documentación
- [x] README.md principal
- [x] INICIO_RAPIDO.md con instrucciones
- [x] MIGRACION.md explicando cambios
- [x] Script PowerShell para iniciar proyecto

---

## 🔧 FASE 2: SERIALIZERS Y VIEWSETS (SIGUIENTE)

### Crear Serializers de DRF

**auth_app/serializers.py**
- [ ] `CargoSerializer`
- [ ] `UsuarioSerializer` (sin contraseña)
- [ ] `UsuarioLoginSerializer`

**medicamentos/serializers.py**
- [ ] `CategoriaSerializer`
- [ ] `MedicamentoSerializer`

**clientes/serializers.py**
- [ ] `ClienteSerializer`

**ventas/serializers.py**
- [ ] `ComprobanteSerializer`
- [ ] `DetalleVentaSerializer`
- [ ] `VentaSerializer` (con detalles anidados)

### Crear ViewSets de DRF

**auth_app/views.py**
- [ ] ViewSet para autenticación (login, logout)
- [ ] ViewSet para Usuarios
- [ ] ViewSet para Cargos

**medicamentos/views.py**
- [ ] ViewSet para Medicamentos (CRUD completo)
- [ ] ViewSet para Categorías

**clientes/views.py**
- [ ] ViewSet para Clientes (CRUD completo)

**ventas/views.py**
- [ ] ViewSet para Ventas (crear, listar, actualizar)
- [ ] ViewSet para Comprobantes
- [ ] Vistas personalizadas para reportes

### Configurar URLs (botica_config/urls.py)
- [ ] Registrar todos los routers
- [ ] Endpoints de API:
  ```
  /api/auth/login/
  /api/auth/logout/
  /api/usuarios/
  /api/cargos/
  /api/medicamentos/
  /api/categorias/
  /api/clientes/
  /api/ventas/
  /api/comprobantes/
  ```

---

## 🎨 FASE 3: COMPONENTES REACT

### Autenticación
- [ ] Página de Login
- [ ] Página de Logout
- [ ] Protección de rutas (PrivateRoute)
- [ ] Contexto de autenticación

### Medicamentos
- [ ] Página de listado
- [ ] Modal/Form para crear
- [ ] Modal/Form para editar
- [ ] Botón de eliminar con confirmación
- [ ] Búsqueda y filtros
- [ ] Tabla con paginación

### Clientes
- [ ] Página de listado
- [ ] Modal/Form para crear
- [ ] Modal/Form para editar
- [ ] Búsqueda y filtros
- [ ] Vista de detalle del cliente

### Ventas
- [ ] Página de ventas
- [ ] Formulario para nueva venta
- [ ] Selector de cliente
- [ ] Selector de medicamentos
- [ ] Cálculo automático de totales
- [ ] Listado histórico de ventas
- [ ] Vista de detalle de venta
- [ ] Reporte de ventas por fecha

### Layout General
- [ ] Navbar/Header con usuario
- [ ] Sidebar/Menu principal
- [ ] Footer
- [ ] Breadcrumbs de navegación

---

## 🔐 FASE 4: AUTENTICACIÓN Y SEGURIDAD

### Backend
- [ ] Implementar JWT tokens (opcional pero recomendado)
- [ ] Autenticación con sesiones de Django
- [ ] Permisos por roles (cargo)
- [ ] Validación de datos en serializers
- [ ] Manejo de excepciones/errores

### Frontend
- [ ] Guardar token en localStorage
- [ ] Interceptor de Axios para agregar token
- [ ] Manejo de errores 401 (token expirado)
- [ ] Refresh token (si usas JWT)

---

## 📊 FASE 5: FUNCIONALIDADES AVANZADAS

### Reportes
- [ ] Reporte de ventas por fecha
- [ ] Reporte de medicamentos más vendidos
- [ ] Reporte de stock bajo
- [ ] Reporte por cliente
- [ ] Exportar a PDF/Excel

### Dashboard
- [ ] Resumen de ventas del día
- [ ] Gráficos de ventas (Chart.js o similar)
- [ ] Medicamentos con stock bajo
- [ ] Últimas transacciones
- [ ] Estadísticas generales

### Inventario
- [ ] Alerts de stock mínimo
- [ ] Historial de cambios de stock
- [ ] Entrada y salida de medicamentos
- [ ] Ajuste manual de stock

### Facturación
- [ ] Generación de boletas/facturas
- [ ] Numeración automática
- [ ] Guardado de comprobantes
- [ ] Impresión de comprobante

---

## 🧪 FASE 6: TESTING

### Backend
- [ ] Tests unitarios para modelos
- [ ] Tests para APIs (test_views.py)
- [ ] Tests de permisos y autenticación
- [ ] Coverage mínimo: 70%

### Frontend
- [ ] Tests de componentes
- [ ] Tests de integración con API
- [ ] Tests de rutas
- [ ] Testing de formularios

---

## 📱 FASE 7: OPTIMIZACIÓN

### Backend
- [ ] Optimizar queries (select_related, prefetch_related)
- [ ] Paginación en listados
- [ ] Cache de datos que no cambian frecuentemente
- [ ] Throttling de API

### Frontend
- [ ] Lazy loading de componentes
- [ ] Optimización de imágenes
- [ ] Minificación de código
- [ ] Service Workers para PWA

---

## 🚀 FASE 8: DEPLOYMENT

### Preparación
- [ ] Cambiar DEBUG=False en producción
- [ ] Usar base de datos PostgreSQL (Supabase)
- [ ] Configurar SECRET_KEY seguro
- [ ] Whitelist de ALLOWED_HOSTS
- [ ] CORS configurado para dominio de producción

### Backend
- [ ] Usar Gunicorn o similar
- [ ] Nginx como reverse proxy
- [ ] SSL/HTTPS certificado
- [ ] Variables de entorno seguras
- [ ] Logs centralizados

### Frontend
- [ ] Build de producción (npm run build)
- [ ] Desplegar en Vercel, Netlify o similar
- [ ] Dominio personalizado
- [ ] CDN para assets estáticos

---

## 📝 NOTAS IMPORTANTES

### Credenciales por Defecto
- **Admin Django**: admin / admin123 ⚠️ CAMBIAR EN PRODUCCIÓN
- **Supabase URL**: https://avyahubwrenxgxmusifc.supabase.co
- **Base de Datos**: SQLite (desarrollo), PostgreSQL (producción)

### Puertos
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173
- **Admin Django**: http://localhost:8000/admin

### Variables de Entorno Críticas
```env
# Backend (.env)
SECRET_KEY=cambiar-en-produccion
DEBUG=False (en producción)
ALLOWED_HOSTS=dominio.com

# Frontend (.env)
VITE_API_URL=https://api.dominio.com
```

---

## 🎯 Prioridades de Desarrollo

### CRÍTICO (Hacer primero)
1. [x] Configuración base ✅
2. [ ] Serializers y ViewSets de DRF
3. [ ] Autenticación funcionando
4. [ ] CRUD de medicamentos
5. [ ] CRUD de clientes
6. [ ] Crear venta básica

### IMPORTANTE (Segundo)
7. [ ] Frontend completo
8. [ ] Reportes de ventas
9. [ ] Dashboard
10. [ ] Validaciones completas

### OPCIONAL (Último)
11. [ ] PWA/Service Workers
12. [ ] Gráficos avanzados
13. [ ] Análitica
14. [ ] Notificaciones push

---

## 📞 Recursos Útiles

### Documentación
- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- React: https://react.dev/
- Vite: https://vitejs.dev/

### Librerías Recomendadas (a instalar después)
```bash
# Backend
pip install django-filter  # Filtrado en APIs
pip install celery        # Tasks asincrónicas
pip install djoser        # Auth avanzada

# Frontend
npm install zustand       # State management
npm install react-query   # Data fetching
npm install tailwindcss   # Estilos
npm install chart.js      # Gráficos
```

---

## ✨ Estado Actual

```
COMPLETADO EN ESTA SESIÓN:
├─ [x] Estructura del proyecto
├─ [x] Configuración de Django
├─ [x] Configuración de React
├─ [x] Modelos de datos
├─ [x] Migraciones
├─ [x] Admin Django
└─ [x] Documentación

PRÓXIMOS PASOS:
├─ [ ] Serializers
├─ [ ] ViewSets
├─ [ ] Componentes React
└─ [ ] Integración completa
```

---

**Última Actualización**: Abril 2026  
**Versión**: 2.0 (Django + React)  
**Progreso**: 20% (Fase 1 completada)

Para comenzar con la Fase 2, consulta:
- Tutorial: https://www.django-rest-framework.org/tutorial/quickstart/
- Archivos de ejemplo en el proyecto
