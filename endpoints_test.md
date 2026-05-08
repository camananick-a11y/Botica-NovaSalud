# 🧪 GUÍA COMPLETA DE PRUEBAS - ENDPOINTS API

Usa esta guía definitiva para probar todos los módulos del sistema.

## 🔑 1. AUTENTICACIÓN (JWT)

- **Login**: `POST /api/token/`
  ```json
  {
      "usuario": "admin",
      "password": "admin1234"
  }
  ```
- **Refrescar Token**: `POST /api/token/refresh/` (usar campo `refresh`).

---

## 👥 2. CLIENTES (`/api/clientes/`)
- **Listar**: `GET /api/clientes/`
- **Crear**: `POST /api/clientes/`
  ```json
  {
      "nombre": "Juan Pérez",
      "tipo_documento": "DNI",
      "numero_documento": "12345678",
      "correo": "juan@example.com",
      "telefono": "987654321",
      "direccion": "Av. Siempre Viva 123"
  }
  ```

---

## 💊 3. MEDICAMENTOS Y MANTENIMIENTO

- **Laboratorios**: `GET/POST /api/medicamentos/laboratorios/`
- **Categorías**: `GET/POST /api/medicamentos/categorias/`
- **Presentaciones**: `GET/POST /api/medicamentos/presentaciones/`
- **Unidades**: `GET/POST /api/medicamentos/unidades/`

- **Crear Medicamento (Inicializa Stock)**: `POST /api/medicamentos/`
  ```json
  {
      "nombre": "Paracetamol 500mg",
      "precio": 0.50,
      "id_laboratorio": 1,
      "id_categoria": 1,
      "id_presentacion": 1,
      "id_unidad": 1,
      "cantidad_inicial": 100
  }
  ```

- **Ver Stock Actual**: `GET /api/medicamentos/stock/`

---

## 🧾 4. VENTAS (COMPROBANTES)

- **Crear Venta (Con Validación de Stock)**: `POST /api/ventas/comprobantes/`
  ```json
  {
      "tipo": "boleta",
      "serie": "B001",
      "id_cliente": 1,
      "detalles": [
          {
              "id_medicamento": 1,
              "cantidad": 5,
              "precio_unitario": 0.50
          },
          {
              "id_medicamento": 2,
              "cantidad": 10,
              "precio_unitario": 1.20
          }
      ]
  }
  ```
  *Nota: El sistema descuenta stock automáticamente y asigna el usuario del token.*

---

## 📊 5. REPORTES ESPECIALIZADOS
- **Ventas por Fecha**: `GET /api/ventas/comprobantes/reporte_ventas_fecha/?inicio=2024-01-01&fin=2024-12-31`
- **Top 10 Más Vendidos**: `GET /api/ventas/comprobantes/medicamentos_mas_vendidos/`
- **Alerta Stock Bajo**: `GET /api/ventas/comprobantes/stock_bajo/?umbral=5`

---

## 🛡️ 6. CONTROL DE ACCESO (ROLES)
- **Vendedor**: `/api/clientes/`, `/api/ventas/` (CRUD).
- **Almacenero**: `/api/medicamentos/` (CRUD), `/api/medicamentos/stock/`.
- **Supervisor**: `/api/ventas/comprobantes/` (Solo Reportes).
- **Admin**: Acceso Total.

## 🛠️ TIPS
1. **Trailing Slash**: Todas las URLs deben terminar en `/`.
2. **Header**: `Authorization: Bearer <access_token>`.
3. **Errores**: 
   - `400`: Error de validación (ej. Stock insuficiente).
   - `403`: No tienes el Rol adecuado.
