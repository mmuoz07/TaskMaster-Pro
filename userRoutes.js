const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener perfil del usuario
router.get('/perfil/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await pool.query('SELECT id, nombre_completo, email_corporativo FROM usuarios WHERE id = $1', [id]);
        
        if (user.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuario" });
    }
});

module.exports = router;
