
const db = require("../Config/db");
const { generarToken } = require("../Utils/token");
const bcrypt = require("bcrypt");

const registrarUsuario = async (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;

  // Encriptar contraseña
  let passwordHash;

  try {
    passwordHash = await bcrypt.hash(password, 10);
  } catch (errorHash) {
    console.error("ERROR AL ENCRIPTAR:", errorHash);

    return res.status(500).json({
      mensaje: "Error al registrar el usuario",
    });
  }

  const sqlExiste = `
    SELECT id_usuario
    FROM usuario
    WHERE email = ?
  `;

  db.query(sqlExiste, [email], (error, filas) => {
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

    // Insertar usuario
    const sqlInsert = `
      INSERT INTO usuario
        (nombre, apellido, email, \`contraseña\`, telefono, fecha_registro, rol)
      VALUES (?, ?, ?, ?, ?, CURDATE(), 'usuario')
    `;

    db.query(
      sqlInsert,
      [nombre, apellido, email, passwordHash, telefono],
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

        const usuario = {
          id_usuario: resultado.insertId,
          nombre,
          apellido,
          email,
          telefono,
          rol: "usuario",
        };

        // Generar JWT
        let token = null;

        try {
          token = generarToken({
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            rol: usuario.rol,
          });
        } catch (errorToken) {
          console.error("ERROR AL GENERAR EL TOKEN:", errorToken);
        }

        return res.status(201).json({
          mensaje: "Usuario registrado correctamente",
          token,
          usuario,
        });
      }
    );
  });
};

module.exports = { registrarUsuario };
