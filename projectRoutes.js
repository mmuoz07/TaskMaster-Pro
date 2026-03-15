const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener proyectos (si decides usarlos luego)
router.get('/', async (req, res) => {
    try {
        const projects = await pool.query('SELECT * FROM proyectos ORDER BY creado_at DESC');
        res.json(projects.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener proyectos" });
    }
});

module.exports = router;
