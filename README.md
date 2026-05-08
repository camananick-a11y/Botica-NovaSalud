# 💊 Botica NovaSalud - Sistema de Gestión Farmacéutica

Este es el núcleo del sistema **Botica NovaSalud**, construido con una arquitectura moderna desacoplada.

## 🚀 Tecnologías Core

🐍 Django 6+

⚡ Django REST Framework

🔐 SimpleJWT (Autenticación)

🗄️ Supabase (PostgreSQL)

🌐 CORS Headers

🧪 Python 3.10+

---

## 🏗️ Módulos del Sistema

### 🔐 Auth & Roles (`auth_app`)
- Gestión de usuarios y cargos.
- Roles: `Administrador`, `Vendedor`, `Almacenero`, `Supervisor`.
- Seguridad: Hashing PBKDF2 y tokens dinámicos.

### 📦 Inventario (`medicamentos`)
- Catálogo normalizado: Categorías, Laboratorios, Presentaciones y Unidades.
- **Stock Inteligente**: Gestión separada en `StockMedicamento` para mayor rendimiento.

### 👥 Clientes (`clientes`)
- Gestión integral de clientes con validación de documentos (DNI/RUC).

### 🧾 Ventas (`ventas`)
- **Transacciones Seguras**: Validación de stock en tiempo real antes de confirmar la venta.
- **Descuento Automático**: Actualización inmediata del inventario en Supabase tras la venta.
- **Auditoría**: Registro automático del usuario que emite el comprobante.

---

## 📊 Analítica y Reportes
El sistema incluye endpoints especializados para la toma de decisiones:
- `reporte_ventas_fecha`: Analiza el flujo de caja por rangos de tiempo.
- `medicamentos_mas_vendidos`: Identifica el Top 10 de productos con mayor salida.
- `stock_bajo`: Alertas preventivas para reposición de inventario.

---

## ⚙️ Configuración del Entorno
1. Copia `backend/.env.example` a `backend/.env`.
2. Configura tu `DB_URL` y `SUPABASE_SECRET_KEY`.
3. Inicia el sistema con `.\start-project.ps1`.

---

**Desarrollado para**: Botica NovaSalud  
**Versión**: 2.5 (Professional Release)
