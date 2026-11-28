const jwt = require("jsonwebtoken");
const db = require("../Config/db");

const verificarToken = (req, res, next) => {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Falta el token de autenticación.",
    });
  }

  const token = cabecera.split(" ")[1];

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      mensaje: "Token inválido o vencido.",
    });
  }

  // Verificar que la cuenta siga existiendo y esté activa
  db.query(
    "SELECT activo FROM usuario WHERE id_usuario = ?",
    [payload.id_usuario],
    (error, resultados) => {
      if (error) {
        console.error("ERROR AL VERIFICAR LA CUENTA:", error);

        return res.status(500).json({
          mensaje: "Error al verificar la sesión.",
        });
      }

      if (resultados.length === 0 || Number(resultados[0].activo) === 0) {
        return res.status(403).json({
          mensaje: "Tu cuenta está inactiva o ya no existe.",
        });
      }

      req.usuario = payload;
      next();
    }
  );
};

module.exports = verificarToken;