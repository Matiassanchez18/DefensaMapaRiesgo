
const db = require("../Config/db");

const registrarUsuario = (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;


  const sqlExiste = "SELECT id_usuario FROM usuario WHERE email = ?";

  db.query(sqlExiste, [email], async (error, filas) => {
    if (error) {
      console.error("ERROR MYSQL:", error);
      return res.status(500).json({
        mensaje: "Error al registrar el usuario",
      });
    }

    if (filas.length > 0) {
      return res.status(409).json({
        mensaje: "Ya existe una cuenta con ese email",
        errores: [
          {
            campo: "email",
            mensaje: "Este email ya está registrado",
          },
        ],
      });
    }

    try {
   

      const sqlInsert = `
        INSERT INTO usuario
          (nombre, apellido, email, \`contraseña\`, telefono, fecha_registro, rol)
        VALUES (?, ?, ?, ?, ?, CURDATE(), 'usuario')
      `;

      db.query(
        sqlInsert,
        [nombre, apellido, email, password, telefono],
        (error, resultado) => {
          if (error) {
            if (error.code === "ER_DUP_ENTRY") {
              return res.status(409).json({
                mensaje: "Ya existe una cuenta con ese email",
                errores: [
                  {
                    campo: "email",
                    mensaje: "Este email ya está registrado",
                  },
                ],
              });
            }

            console.error("ERROR MYSQL:", error);

            return res.status(500).json({
              mensaje: "Error al registrar el usuario",
            });
          }

          res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            usuario: {
              id_usuario: resultado.insertId,
              nombre,
              apellido,
              email,
              telefono,
              rol: "usuario",
            },
          });
        }
      );
    } catch (error) {
      console.error("ERROR AL REGISTRAR:", error);

      res.status(500).json({
        mensaje: "Error al registrar el usuario",
      });
    }
  });
};

module.exports = { registrarUsuario };
