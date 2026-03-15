const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Los tokens suelen enviarse como "Bearer TOKEN_AQUÍ"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        // Es vital que JWT_SECRET esté configurado en las variables de entorno de Vercel
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next(); // Permite que la petición continúe a la ruta
    } catch (err) {
        res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};
