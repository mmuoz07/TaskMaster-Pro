const pool = require('../config/db'); // Tu conexión a PostgreSQL
const bcrypt = require('bcrypt');    // Para encriptar contraseñas (necesitas: npm install bcrypt)

// REGISTRAR USUARIO
const registrarUsuario = async (req, res) => {
    const { nombre_completo, email_corporativo, password } = req.body;
    
    try {
        // Encriptamos la contraseña por seguridad
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre_completo, email_corporativo, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [nombre_completo, email_corporativo, password_hash]
        );

        res.status(201).json({ mensaje: "Usuario creado con éxito", usuario: nuevoUsuario.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Error al registrar usuario (posiblemente el email ya existe)" });
    }
};

// INICIAR SESIÓN (LOGIN)
const loginUsuario = async (req, res) => {
    const { email_corporativo, password } = req.body;

    try {
        const usuario = await pool.query('SELECT * FROM usuarios WHERE email_corporativo = $1', [email_corporativo]);

        if (usuario.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Comparamos la contraseña escrita con la de la base de datos
        const passwordValida = await bcrypt.compare(password, usuario.rows[0].password_hash);

        if (!passwordValida) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        res.json({ mensaje: "¡Bienvenido a TaskMaster Pro!", usuario: usuario.rows[0].nombre_completo });
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = { registrarUsuario, loginUsuario };
