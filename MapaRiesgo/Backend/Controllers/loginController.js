const db = require("../Config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const iniciarSesion = (req, res) => {
  const { email, password } = req.body;

  const sql = `
  SELECT id_usuario, nombre, apellido, email, rol,
         \contraseña\ AS passwordGuardada
  FROM usuario
  WHERE email = ?
`;

db.query(sql, [email], async (error, resultados) => {
  if (error) {
    console.error("Error SQL:", error);
    return res.status(500).json({ mensaje: "Error al iniciar sesión." });
  }

  if (resultados.length === 0) {
    return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
  }

  // Se separa la contraseña guardada para no devolverla nunca al frontend
  const { passwordGuardada, ...usuario } = resultados[0];

  let coincide = false;
  try {
    coincide = await bcrypt.compare(password, passwordGuardada);
  } catch {
    coincide = false;
  }

  if (!coincide) {
    return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
  }

  res.status(200).json({ mensaje: "Inicio de sesión correcto.", usuario });
});
};

module.exports = { iniciarSesion };