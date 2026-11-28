const db = require("../Config/db.js");

const obtenerUsuarios = (req, res) => {
  const sql = `
        SELECT id_usuario, nombre, apellido, email,
               telefono, rol, activo, fecha_registro
        FROM usuario
       ORDER BY
    CASE
        WHEN rol = 'admin' THEN 0
        ELSE 1
    END,
    id_usuario DESC
    `;

  db.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener los usuarios",
        error: error.message,
      });
    }

    res.json(resultados);
  });
};

const obtenerUsuarioPorId = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT id_usuario, nombre, apellido, email,
               telefono, rol, activo, fecha_registro
        FROM usuario
        WHERE id_usuario = ?
    `;

  db.query(sql, [id], (error, resultados) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al buscar el usuario",
        error: error.message,
      });
    }

    if (resultados.length === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    res.json(resultados[0]);
  });
};

const crearUsuario = (req, res) => {
  const { nombre, apellido, email, contraseña, telefono } = req.body;

  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({
      mensaje: "Nombre, apellido, email y contraseña son obligatorios",
    });
  }

  const sql = `
        INSERT INTO usuario
        (nombre, apellido, email, contraseña, telefono, fecha_registro)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;

  db.query(
    sql,
    [nombre, apellido, email, contraseña, telefono || null],
    (error, resultado) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            mensaje: "El email ya está registrado",
          });
        }

        return res.status(500).json({
          mensaje: "Error al crear el usuario",
          error: error.message,
        });
      }

      res.status(201).json({
        mensaje: "Usuario creado correctamente",
        id_usuario: resultado.insertId,
      });
    },
  );
};

const modificarUsuario = (req, res) => {
  const { id } = req.params;

  const { nombre, apellido, email, telefono, rol } = req.body;

  if (!nombre || !apellido || !email) {
    return res.status(400).json({
      mensaje: "Nombre, apellido y email son obligatorios",
    });
  }

  if (rol && !["usuario", "admin"].includes(rol)) {
    return res.status(400).json({
      mensaje: "El rol seleccionado no es válido",
    });
  }

  const sql = `
        UPDATE usuario
        SET nombre = ?,
            apellido = ?,
            email = ?,
            telefono = ?,
            rol = ?
        WHERE id_usuario = ?
    `;

  db.query(
    sql,
    [nombre, apellido, email, telefono || null, rol || "usuario", id],
    (error, resultado) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res.status(409).json({
            mensaje: "El email ya pertenece a otro usuario",
          });
        }

        return res.status(500).json({
          mensaje: "Error al modificar el usuario",
          error: error.message,
        });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      res.json({
        mensaje: "Usuario modificado correctamente",
      });
    },
  );
};

const cambiarEstadoUsuario = (req, res) => {
  const { id } = req.params;
  const { activo } = req.body; 

  if (![0, 1].includes(activo)) {
    return res.status(400).json({
      mensaje: "El estado seleccionado no es válido",
    });
  }

  const sql = `
        UPDATE usuario
        SET activo = ?
        WHERE id_usuario = ?
    `;

  db.query(sql, [activo, id], (error, resultado) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al cambiar el estado del usuario",
        error: error.message,
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    res.json({
      mensaje: activo === 1
        ? "Usuario activado correctamente"
        : "Usuario desactivado correctamente",
    });
  });
};

const eliminarUsuario = (req, res) => {
  const { id } = req.params;

  db.getConnection((error, connection) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al conectar con la base de datos",
        error: error.message,
      });
    }

    connection.beginTransaction((error) => {
      if (error) {
        connection.release();

        return res.status(500).json({
          mensaje: "Error al iniciar la transacción",
          error: error.message,
        });
      }

      const sqlTestigos = `
        DELETE FROM testigo
        WHERE id_reporte IN (
          SELECT id_reporte
          FROM reporte
          WHERE id_usuario = ?
        )
      `;

      connection.query(sqlTestigos, [id], (error) => {
        if (error) {
          return connection.rollback(() => {
            connection.release();

            res.status(500).json({
              mensaje: "Error al eliminar los testigos",
              error: error.message,
            });
          });
        }

        // 2. Eliminar los reportes del usuario
        const sqlReportes = `
          DELETE FROM reporte
          WHERE id_usuario = ?
        `;

        connection.query(sqlReportes, [id], (error, resultadoReportes) => {
          if (error) {
            return connection.rollback(() => {
              connection.release();

              res.status(500).json({
                mensaje: "Error al eliminar los reportes",
                error: error.message,
              });
            });
          }

          // 3. Eliminar el usuario
          const sqlUsuario = `
            DELETE FROM usuario
            WHERE id_usuario = ?
          `;

          connection.query(sqlUsuario, [id], (error, resultadoUsuario) => {
            if (error) {
              return connection.rollback(() => {
                connection.release();

                res.status(500).json({
                  mensaje: "Error al eliminar el usuario",
                  error: error.message,
                });
              });
            }

            if (resultadoUsuario.affectedRows === 0) {
              return connection.rollback(() => {
                connection.release();

                res.status(404).json({
                  mensaje: "Usuario no encontrado",
                });
              });
            }

            // 4. Confirmar la transacción
            connection.commit((error) => {
              if (error) {
                return connection.rollback(() => {
                  connection.release();

                  res.status(500).json({
                    mensaje: "Error al confirmar la eliminación",
                    error: error.message,
                  });
                });
              }

              connection.release();

              res.json({
                mensaje: "Usuario y reportes eliminados correctamente",
                reportesEliminados: resultadoReportes.affectedRows,
              });
            });
          });
        });
      });
    });
  });
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  modificarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
};