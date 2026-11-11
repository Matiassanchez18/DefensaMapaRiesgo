const db = require("../Config/db");

const iniciarSesion = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      mensaje: "El correo y la contraseña son obligatorios.",
    });
  }

  const sql = `
    SELECT id_usuario, nombre, apellido, email
    FROM usuario
    WHERE email = ? AND \`contraseña\` = ?
  `;

  db.query(sql, [email, password], (error, resultados) => {
    if (error) {
      console.error("Error SQL:", error);
      return res.status(500).json({ mensaje: "Error al iniciar sesión." });
    }

    if (resultados.length === 0) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos.",
      });
    }

    res.status(200).json({
      mensaje: "Inicio de sesión correcto.",
      usuario: resultados[0],
    });
  });
};

module.exports = { iniciarSesion };