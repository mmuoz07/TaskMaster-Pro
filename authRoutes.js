const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const bcrypt = require('bcrypt');

// REGISTRAR USUARIO
router.post('/register', async (req, res) => {
    const { nombre_completo, email_corporativo, password } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await pool.query(
            'INSERT INTO usuarios (nombre_completo, email_corporativo, password_hash) VALUES ($1, $2, $3)',
            [nombre_completo, email_corporativo, password_hash]
        );

        res.status(201).json({ mensaje: "Usuario creado con éxito" });
    } catch (err) {
        res.status(500).json({ error: "El email ya existe o error de servidor" });
    }
});

// INICIAR SESIÓN (LOGIN)
router.post('/login', async (req, res) => {
    const { email_corporativo, password } = req.body;

    try {
        const usuario = await pool.query('SELECT * FROM usuarios WHERE email_corporativo = $1', [email_corporativo]);

        if (usuario.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const passwordValida = await bcrypt.compare(password, usuario.rows[0].password_hash);

        if (!passwordValida) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        res.json({ mensaje: "Bienvenido", usuario: usuario.rows[0].nombre_completo });
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

module.exports = router;
