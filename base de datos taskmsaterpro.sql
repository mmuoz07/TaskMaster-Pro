-- Crear tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email_corporativo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de tareas
CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_vencimiento DATE,
    estado VARCHAR(20) DEFAULT 'Pendiente', -- Valores: 'Pendiente' o 'Completada'
    creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
