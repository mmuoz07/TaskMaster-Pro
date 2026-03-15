const express = require('express');
const router = express.Router();
const pool = require('../db'); // Conexión a tu base de datos [cite: 1]
const bcrypt = require('bcrypt'); // Para comparar contraseñas encriptadas [cite: 1]

// RUTA DE REGISTRO
router.post('/register', async (req, res) => {
    const { nombre_completo, email_corporativo, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        await pool.query(
            'INSERT INTO usuarios (nombre_completo, email_corporativo, password_hash) VALUES ($1, $2, $3)',
            [nombre_completo, email_corporativo, hash]
        );
        res.status(201).json({ mensaje: "Usuario creado con éxito" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "El email ya está en uso o error de base de datos" });
    }
});

// RUTA DE LOGIN
router.post('/login', async (req, res) => {
    const { email_corporativo, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM usuarios WHERE email_corporativo = $1', [email_corporativo]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        res.json({ 
            mensaje: "¡Bienvenido!", 
            usuario: user.rows[0].nombre_completo 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;
