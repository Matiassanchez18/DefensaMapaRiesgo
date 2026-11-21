const db = require("../Config/db");
const jwt = require("jsonwebtoken");

const iniciarSesion = (req, res) => {
  const { email, password } = req.body;

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

    const usuario = resultados[0];

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      mensaje: "Inicio de sesión correcto.",
      usuario,
      token,
    });
  });
};

module.exports = { iniciarSesion };