// 1. Importaciones de módulos
const express = require('express');
const path = require('path');
require('dotenv').config(); // Carga el archivo .env

// 2. Importación de las Rutas
const authRoutes = require('./routes/authRoutes');
// const taskRoutes = require('./routes/taskRoutes'); // Descomenta cuando crees taskRoutes.js

const app = express();

// 3. Middlewares
// Permite que el servidor entienda JSON (lo que envías desde el frontend)
app.use(express.json());
// Permite procesar datos de formularios normales
app.use(express.urlencoded({ extended: true }));
// Sirve tus archivos estáticos (HTML, CSS, JS de la carpeta raíz)
app.use(express.static(path.join(__dirname, './')));

// 4. Uso de las Rutas (Endpoints API)
app.use('/api/auth', authRoutes);
// app.use('/api/tareas', taskRoutes); // Descomenta cuando lo tengas listo

// 5. Ruta principal para cargar tu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 6. Configuración del Puerto y Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log(`🚀 TaskMaster Pro: Servidor Online`);
    console.log(`🌐 Acceso local: http://localhost:${PORT}`);
    console.log('--------------------------------------------------');
});
