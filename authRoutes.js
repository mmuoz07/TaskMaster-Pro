const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ¡Asegúrate de tener esta línea!

router.post('/login', async (req, res) => {
    const { email_corporativo, password } = req.body;
    try {
        const usuario = await pool.query('SELECT * FROM usuarios WHERE email_corporativo = $1', [email_corporativo]);
        if (usuario.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const passwordValida = await bcrypt.compare(password, usuario.rows[0].password_hash);
        if (!passwordValida) return res.status(401).json({ error: "Contraseña incorrecta" });

        // GENERAR EL TOKEN
        const token = jwt.sign(
            { id: usuario.rows[0].id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            mensaje: "¡Bienvenido!", 
            usuario: usuario.rows[0].nombre_completo,
            token: token // Enviamos el token al frontend
        });
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

module.exports = router;;
