
const db = require("../Config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const iniciarSesion = (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT id_usuario, nombre, apellido, email, rol,
           \`contraseña\` AS passwordGuardada
    FROM usuario
    WHERE email = ?
  `;

  db.query(sql, [email], async (error, resultados) => {
    if (error) {
      console.error("Error SQL:", error);
      return res.status(500).json({
        mensaje: "Error al iniciar sesión."
      });
    }

    if (resultados.length === 0) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos."
      });
    }

    const { passwordGuardada, ...usuario } = resultados[0];

    let coincide = false;

    try {
      coincide = await bcrypt.compare(password, passwordGuardada);
    } catch {
      coincide = false;
    }

    if (!coincide) {
      return res.status(401).json({
        mensaje: "Correo o contraseña incorrectos."
      });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Devolver usuario y token
    res.status(200).json({
      mensaje: "Inicio de sesión correcto.",
      usuario,
      token
    });
  });
};

module.exports = { iniciarSesion };
