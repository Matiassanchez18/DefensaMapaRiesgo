// Se usa DESPUÉS de verificarToken (authToken.js), que deja el usuario en req.usuario
const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({
      mensaje: "No tenés permiso para realizar esta acción.",
    });
  }

  next();
};

module.exports = soloAdmin;