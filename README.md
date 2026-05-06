# Botica-NovaSalud

Este proyecto fue migrado para usar Supabase como base de datos en lugar de MySQL/Workbench.

## Supabase: datos que debes poner

### 1. Crear proyecto
- Nombre del proyecto: `Botica-NovaSalud`
- Región: `Americas` (o la más cercana a tus usuarios)
- Seguridad:
  - `Enable Data API`: activado
  - `Automatically expose new tables`: opcional (recomendado desactivar para mayor control)
  - `Enable automatic RLS`: opcional (recomendado activar si quieres mayor seguridad desde el principio)

### 2. Variables de entorno
Crea un archivo `app/.env` con estos valores:

```env
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SESSION_SECRET=una-clave-secreta-para-sesiones
```

> Si prefieres, también puedes usar `SUPABASE_KEY` para pruebas, pero en producción el `SERVICE_ROLE_KEY` es más completo para el backend.

### 3. Tablas necesarias en Supabase
Crea las siguientes tablas en el esquema `public`.

> Nota importante: en PostgreSQL/Supabase no se usa `auto increment`. Usa `SERIAL` o `GENERATED ALWAYS AS IDENTITY`.

Ejemplo de campo de PK en Supabase:

```sql
id_usuario SERIAL PRIMARY KEY
-- o
id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

#### `cargo`
- `id_cargo` (int8, Primary Key, NOT NULL, Auto-increment)
- `nombre` (varchar, NOT NULL)

Objetivo: guarda los cargos de los empleados, como administrador, cajero o vendedor.

#### `usuario`
- `id_usuario` (int8, Primary Key, NOT NULL, Auto-increment)
- `usuario` (varchar, NOT NULL, UNIQUE) ← **Campo para login, debe ser único**
- `nombre` (varchar, NOT NULL)
- `password` (varchar, NOT NULL)
- `id_cargo` (int8, NOT NULL, Foreign Key -> cargo.id_cargo)

Objetivo: representa a los empleados que usan el sistema. Almacena credenciales de login (usuario/password) y asigna un cargo.

#### `cliente`
- `id_cliente` (int8, Primary Key, NOT NULL, Auto-increment)
- `nombre` (varchar, NOT NULL)

Objetivo: almacena los clientes que compran en la botica. Cada comprobante se vincula a un cliente.

#### `laboratorio`
- `id_laboratorio` (int8, Primary Key, NOT NULL, Auto-increment)
- `nombre` (varchar, NOT NULL)

Objetivo: guarda los fabricantes de los medicamentos, como Pharma, Portugal, Hersil, Abbott, etc.

#### `categoria`
- `id_categoria` (int8, Primary Key, NOT NULL, Auto-increment)
- `nombre` (varchar, NOT NULL)

Objetivo: clasifica los medicamentos por tipo, como Antibióticos o Cuidado Personal.

#### `presentacion`
- `id_presentacion` (int8, Primary Key, NOT NULL, Auto-increment)
- `nombre` (varchar, NOT NULL)

Objetivo: describe la forma de presentación del medicamento, como Pastilla, Jarabe o Inyectable.

#### `unidad`
- `id_unidad` (int8, Primary Key, NOT NULL, Auto-increment)
- `nombre` (varchar, NOT NULL)

Objetivo: define la unidad de venta del medicamento, por ejemplo Unidad, Blíster o Caja.

#### `medicamento`
- `id_medicamento` (int8, Primary Key, NOT NULL, Auto-increment)
- `nombre` (varchar, NOT NULL)
- `precio` (numeric, NOT NULL)
- `id_laboratorio` (int8, NOT NULL, Foreign Key -> laboratorio.id_laboratorio)
- `id_categoria` (int8, NOT NULL, Foreign Key -> categoria.id_categoria)
- `id_presentacion` (int8, NOT NULL, Foreign Key -> presentacion.id_presentacion)
- `id_unidad` (int8, NOT NULL, Foreign Key -> unidad.id_unidad)

Objetivo: contiene el catálogo de productos de la botica, con su precio, laboratorio, categoría, presentación y unidad de venta.

#### `stock_medicamento` (recomendado)
- `id_stock` (int8, Primary Key, NOT NULL, Auto-increment)
- `id_medicamento` (int8, NOT NULL, Foreign Key -> medicamento.id_medicamento)
- `cantidad` (int4, NOT NULL, DEFAULT 0)

Objetivo: controla el inventario disponible para cada medicamento, útil para ventas y reposición.

#### `comprobante`
- `id_comprobante` (int8, Primary Key, NOT NULL, Auto-increment)
- `serie` (varchar, NOT NULL)
- `tipo` (varchar, NOT NULL) ← Valores: "boleta" o "factura"
- `fecha` (timestamp with time zone, NOT NULL, DEFAULT now())
- `total` (numeric, NOT NULL)
- `id_cliente` (int8, NOT NULL, Foreign Key -> cliente.id_cliente)
- `id_usuario` (int8, NOT NULL, Foreign Key -> usuario.id_usuario)

Objetivo: representa el documento de venta emitido al cliente, ya sea boleta o factura, e indica quién lo generó, cuándo y cuánto vale.

#### `detalle_venta`
- `id_detalle` (int8, Primary Key, NOT NULL, Auto-increment)
- `id_comprobante` (int8, NOT NULL, Foreign Key -> comprobante.id_comprobante)
- `id_medicamento` (int8, NOT NULL, Foreign Key -> medicamento.id_medicamento)
- `cantidad` (int4, NOT NULL)
- `precio_unitario` (numeric, NOT NULL)
- `subtotal` (numeric, NOT NULL)

Objetivo: guarda cada producto incluido en un comprobante, con su cantidad, precio unitario y subtotal para calcular el total de la venta.

**Leyenda de atributos:**
- `NOT NULL`: Campo obligatorio, no puede estar vacío
- `UNIQUE`: Valor único en toda la columna (solo un registro puede tener ese valor)
- `Foreign Key`: Referencia a otra tabla
- `DEFAULT`: Valor por defecto si no se especifica
- `Auto-increment`: Se genera automáticamente

### 4. Permisos y relaciones
- Asegúrate de que las relaciones entre tablas están definidas en Supabase.
- Si activas RLS, habilita políticas básicas para lectura/insert en las tablas necesarias o prueba primero sin RLS.

### 5. Instalación del proyecto
Desde la carpeta `app`:

```bash
npm install
```

### 6. Ejecutar la aplicación

```bash
npm run dev
```

### 7. Notas importantes
- `app/config/db.js` ya está configurado para leer `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- `app/.env.example` sirve como ejemplo de configuración.
- Si haces cambios en el esquema, revisa las consultas en `app/routes/`.
