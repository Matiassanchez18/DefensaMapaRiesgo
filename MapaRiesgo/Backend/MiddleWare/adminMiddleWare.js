
const adminMiddleware = (req, res, next) => {
    const usuario = req.usuario;

    if (!usuario) {
        return res.status(401).json({
            mensaje: "Debés iniciar sesión para acceder."
        });
    }

    if (usuario.rol !== "admin") {
        return res.status(403).json({
            mensaje: "No tenés permisos para acceder a esta sección."
        });
    }

    next();
};

module.exports = adminMiddleware;
