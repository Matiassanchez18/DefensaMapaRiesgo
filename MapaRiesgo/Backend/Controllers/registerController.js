const db = require("../Config/db");

const registrarUsuario = (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;

  // 1) ¿Ya existe una cuenta con ese email?
  const sqlExiste = "SELECT id_usuario FROM usuario WHERE email = ?";

  db.query(sqlExiste, [email], async (error, filas) => {
    if (error) {
      console.error("ERROR MYSQL:", error);
      return res.status(500).json({ mensaje: "Error al registrar el usuario" });
    }

    if (filas.length > 0) {
      return res.status(409).json({
        mensaje: "Ya existe una cuenta con ese email",
        errores: [{ campo: "email", mensaje: "Este email ya está registrado" }],
      });
    }

    try {
      // 2) Se guarda la contraseña hasheada, nunca en texto plano

      // La columna se llama `contraseña` (con ñ), por eso va entre backticks
      const sqlInsert = `
        INSERT INTO usuario
          (nombre, apellido, email, \`contraseña\`, telefono, fecha_registro)
        VALUES (?, ?, ?, ?, ?, CURDATE())
      `;

      db.query(
        sqlInsert,
        [nombre, apellido, email, password, telefono],
        (error, resultado) => {
          if (error) {
            // Por si dos personas se registran con el mismo email al mismo tiempo
            if (error.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                mensaje: "Ya existe una cuenta con ese email",
                errores: [
                  { campo: "email", mensaje: "Este email ya está registrado" },
                ],
              });
            }

            console.error("ERROR MYSQL:", error);
            return res
              .status(500)
              .json({ mensaje: "Error al registrar el usuario" });
          }

          // Nunca se devuelve la contraseña
          res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            usuario: {
              id_usuario: resultado.insertId,
              nombre,
              apellido,
              email,
              telefono,
            },
          });
        },
      );
    } catch (error) {
      console.error("ERROR AL ENCRIPTAR:", error);
      res.status(500).json({ mensaje: "Error al registrar el usuario" });
    }
  });
};

module.exports = { registrarUsuario };
