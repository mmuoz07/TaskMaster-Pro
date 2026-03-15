const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las tareas
router.get('/', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM tareas ORDER BY creado_at DESC');
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar tareas" });
    }
});

// Crear una tarea nueva
router.post('/', async (req, res) => {
    const { descripcion, fecha_vencimiento } = req.body;
    try {
        await pool.query(
            'INSERT INTO tareas (descripcion, fecha_vencimiento, estado) VALUES ($1, $2, $3)',
            [descripcion, fecha_vencimiento, 'Pendiente']
        );
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ error: "No se pudo guardar la tarea" });
    }
});

module.exports = router;
