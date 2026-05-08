# 🧪 GUÍA DE PRUEBAS CON POSTMAN (NUEVO ESQUEMA SUPABASE)

Esta guía detalla cómo probar la API utilizando la estructura exacta que tienes en tu base de datos Supabase.

## 🚀 Preparación

1. Asegúrate de tener el entorno virtual activo y el servidor corriendo:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver
   ```
2. La URL base de la API será: `http://localhost:8000/api/`

---

## 🔐 1. Autenticación (Login)

### ➡️ Iniciar Sesión (Login)
- **URL**: `http://localhost:8000/api/auth/usuarios/login/`
- **Método**: `POST`
- **Body** (JSON):
  ```json
  {
      "usuario": "admin",
      "password": "admin123"
  }
  ```
- **Respuesta Esperada** (200 OK):
  Devolverá la información del usuario incluyendo su cargo. (Nota: Si borramos la base de datos, primero debes registrar un usuario en `/api/auth/usuarios/`).

---

## 💊 2. Medicamentos y Categorías

### ➡️ Crear Entidades Base (Ejecutar en este orden)
Primero debes crear un Laboratorio, Categoría, Presentación y Unidad.

**Laboratorio:** `POST /api/medicamentos/laboratorios/`
```json
{"nombre": "Portugal"}
```
**Categoría:** `POST /api/medicamentos/categorias/`
```json
{"nombre": "Analgésicos"}
```
**Presentación:** `POST /api/medicamentos/presentaciones/`
```json
{"nombre": "Pastilla"}
```
**Unidad:** `POST /api/medicamentos/unidades/`
```json
{"nombre": "Blíster"}
```

### ➡️ Registrar un Medicamento
- **URL**: `http://localhost:8000/api/medicamentos/`
- **Método**: `POST`
- **Body** (JSON):
  ```json
  {
      "nombre": "Paracetamol 500mg",
      "precio": 3.50,
      "id_laboratorio": 1,
      "id_categoria": 1,
      "id_presentacion": 1,
      "id_unidad": 1,
      "cantidad_inicial": 100
  }
  ```
*(Nota: Hemos agregado `cantidad_inicial` para que al crear el medicamento, se inserte automáticamente en la tabla de `stock_medicamento`).*

### ➡️ Listar Medicamentos
- **URL**: `http://localhost:8000/api/medicamentos/`
- **Método**: `GET`
- **Respuesta**: Verás el medicamento y su stock anidado.

---

## 👥 3. Clientes

### ➡️ Registrar un Cliente
- **URL**: `http://localhost:8000/api/clientes/`
- **Método**: `POST`
- **Body** (JSON):
  ```json
  {
      "nombre": "Juan Pérez"
  }
  ```

---

## 🛒 4. Ventas (Comprobantes)

La tabla de `comprobante` y `detalle_venta` ahora son las responsables de registrar la transacción (descontará el stock automáticamente).

### ➡️ Emitir un Comprobante de Venta Completo
- **URL**: `http://localhost:8000/api/ventas/comprobantes/`
- **Método**: `POST`
- **Body** (JSON):
  ```json
  {
      "serie": "B001",
      "tipo": "boleta",
      "id_cliente": 1,
      "id_usuario": 1,
      "detalles": [
          {
              "id_medicamento": 1,
              "cantidad": 2,
              "precio_unitario": 3.50
          }
      ]
  }
  ```
- **Nota**: El backend automáticamente calculará el `total`, calculará los `subtotal` de cada detalle, guardará todo y **descontará 2 unidades** del stock del medicamento "1".
- **IMPORTANTE**: Si vuelves a enviar la misma petición y te da error, es porque la combinación de "serie" y el ID auto incremental que se asume debe ser única, o simplemente puedes enviar una nueva factura.

---

## 🛠️ Conexión a Supabase

Dado que el código ha sido actualizado para hacer match 100% con tu `README.md`, los siguientes pasos conectarán tu proyecto a la nube:

1. Modifica tu archivo `backend/.env` (créalo si no existe) con tus datos de conexión a Supabase Postgres (los obtienes en Settings > Database > Connection String en tu panel de Supabase).
   ```env
   DATABASE_URL=postgres://postgres.[tusubdominio]:[tupassword]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
2. Asegúrate de que `backend/botica_config/settings.py` esté leyendo la URL usando `dj-database-url` (o mantenlo en SQLite por ahora para probar todo localmente con Postman).
3. Corre `python manage.py makemigrations` y `python manage.py migrate`.
