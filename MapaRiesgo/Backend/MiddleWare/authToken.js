const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Falta el token de autenticación.",
    });
  }

  const token = cabecera.split(" ")[1];

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      mensaje: "Token inválido o vencido.",
    });
  }
};

module.exports = verificarToken;