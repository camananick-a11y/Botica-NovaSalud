CREATE DATABASE IF NOT EXISTS botica_nova_salud
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE botica_nova_salud;

-- Table: laboratorio
CREATE TABLE laboratorio (
    id_laboratorio INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: categoria
CREATE TABLE categoria (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: presentacion
CREATE TABLE presentacion (
    id_presentacion INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: cargo
CREATE TABLE cargo (
    id_cargo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: usuario (agregada columna password)
CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    id_cargo INT NOT NULL,
    FOREIGN KEY (id_cargo) REFERENCES cargo(id_cargo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: cliente
CREATE TABLE cliente (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: medicamento
CREATE TABLE medicamento (
    id_medicamento INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    id_laboratorio INT NOT NULL,
    id_categoria INT NOT NULL,
    id_presentacion INT NOT NULL,
    FOREIGN KEY (id_laboratorio) REFERENCES laboratorio(id_laboratorio),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_presentacion) REFERENCES presentacion(id_presentacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: comprobante
CREATE TABLE comprobante (
    id_comprobante INT PRIMARY KEY AUTO_INCREMENT,
    serie VARCHAR(20) NOT NULL,
    tipo ENUM('boleta', 'factura') NOT NULL,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: detalle_venta
CREATE TABLE detalle_venta (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_comprobante INT NOT NULL,
    id_medicamento INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_comprobante) REFERENCES comprobante(id_comprobante),
    FOREIGN KEY (id_medicamento) REFERENCES medicamento(id_medicamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos de prueba
INSERT INTO laboratorio (nombre) VALUES ('Bayer'), ('Pfizer');
INSERT INTO categoria (nombre) VALUES ('Analgésicos'), ('Antibióticos');
INSERT INTO presentacion (tipo) VALUES ('Tabletas 500mg'), ('Jarabe 100ml');
INSERT INTO cargo (nombre) VALUES ('Administrador'), ('Farmacéutico');
-- Usuario admin: contraseña admin123 (se hasheará automáticamente al primer login)
INSERT INTO usuario (nombre, password, id_cargo) VALUES ('admin', 'admin123', 1);
INSERT INTO cliente (nombre) VALUES ('Juan Pérez'), ('María García');
INSERT INTO medicamento (nombre, precio, id_laboratorio, id_categoria, id_presentacion) VALUES
('Paracetamol', 5.00, 1, 1, 1),
('Ibuprofeno', 12.50, 2, 1, 2);
