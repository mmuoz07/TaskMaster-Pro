const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const { email_corporativo } = req.body;
    // Login automático para cualquier correo
    res.json({ 
        mensaje: "¡Bienvenido!", 
        usuario: email_corporativo.split('@')[0], // Usa el nombre del correo
        token: "token-falso-de-prueba" 
    });
});

router.post('/register', (req, res) => {
    res.json({ mensaje: "Usuario registrado correctamente" });
});

module.exports = router; 
