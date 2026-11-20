const db = require("../Config/db");

const TAM_CELDA = 0.005;

const obtenerOCrearZona = (latitud, longitud, callback) => {
  const fila = Math.floor(latitud / TAM_CELDA);
  const columna = Math.floor(longitud / TAM_CELDA);

  const codigoCelda = `${fila}_${columna}`;

  const centroLatitud = (fila + 0.5) * TAM_CELDA;
  const centroLongitud = (columna + 0.5) * TAM_CELDA;

  const nombre = `Zona ${codigoCelda}`;

  const sql = `
    INSERT INTO zona
    (
      codigo_celda,
      nombre,
      descripcion,
      nivel_riesgo,
      latitud,
      longitud
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      id_zona = LAST_INSERT_ID(id_zona)
  `;

  db.query(
    sql,
    [
      codigoCelda,
      nombre,
      "Zona generada automáticamente según los reportes.",
      "Bajo",
      centroLatitud,
      centroLongitud,
    ],
    (error, resultado) => {
      if (error) return callback(error);

      callback(null, resultado.insertId);
    },
  );
};


const agregarReporte = (req, res) => {
  const {
    id_usuario,
    id_delito,
    direccion,
    descripcion,
    testigos,
    latitud,
    longitud,
    nombre_testigo,
    apellido_testigo,
    telefono_testigo,
  } = req.body;

  const hayTestigos =
    testigos === true ||
    testigos === 1 ||
    testigos === "1" ||
    testigos === "si";

  const nombre = String(nombre_testigo || "").trim();
  const apellido = String(apellido_testigo || "").trim();
  const telefono = String(telefono_testigo || "").trim();

  if (!id_usuario || !Number.isInteger(Number(id_usuario))) {
    return res.status(400).json({
      mensaje: "Debés iniciar sesión para cargar un reporte.",
    });
  }

  const idDelito = Number(id_delito);

  if (!Number.isInteger(idDelito) || idDelito <= 0) {
    return res.status(400).json({
      mensaje: "El delito indicado no es válido.",
    });
  }

  const lat = Number(latitud);
  const lng = Number(longitud);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return res.status(400).json({
      mensaje: "Las coordenadas no son válidas.",
    });
  }

  if (hayTestigos && (!nombre || !apellido)) {
    return res.status(400).json({
      mensaje: "Debés completar el nombre y apellido del testigo.",
      recibido: {
        nombre_testigo,
        apellido_testigo,
        testigos,
      },
    });
  }

  obtenerOCrearZona(lat, lng, (error, idZona) => {
    if (error) {
      console.error("Error al obtener o crear zona:", error);

      return res.status(500).json({
        mensaje: "Error al obtener o crear la zona.",
        detalle: error.sqlMessage,
      });
    }

    const sqlReporte = `
      INSERT INTO reporte
      (
        id_usuario,
        id_delito,
        id_zona,
        fecha,
        hora,
        descripcion,
        latitud,
        longitud,
        estado,
        testigos,
        direccion
      )
      VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sqlReporte,
      [
        Number(id_usuario),
        idDelito,
        idZona,
        descripcion,
        lat,
        lng,
        "Pendiente",
        hayTestigos ? 1 : 0,
        direccion,
      ],
      (error, resultado) => {
        if (error) {
          console.error("Error al guardar reporte:", error);

          return res.status(500).json({
            mensaje: "Error al guardar el reporte.",
            detalle: error.sqlMessage,
          });
        }

        const idReporte = resultado.insertId;

        const guardarEstadistica = () => {
          const sqlEstadistica = `
            INSERT INTO estadistica
            (
              id_zona,
              id_delito,
              cantidad_delitos,
              periodo,
              fecha_actualizacion
            )
            VALUES (?, ?, 1, CURDATE(), CURDATE())
            ON DUPLICATE KEY UPDATE
              cantidad_delitos = cantidad_delitos + 1,
              fecha_actualizacion = CURDATE()
          `;

          db.query(sqlEstadistica, [idZona, idDelito], (error) => {
            if (error) {
              console.error("Error al actualizar estadística:", error);

              return res.status(500).json({
                mensaje:
                  "El reporte se guardó, pero no se pudo actualizar la estadística.",
                id_reporte: idReporte,
                detalle: error.sqlMessage,
              });
            }

            return res.status(201).json({
              mensaje: "Reporte guardado correctamente.",
              id_reporte: idReporte,
              id_zona: idZona,
              id_usuario: Number(id_usuario),
            });
          });
        };

        const insertarTestigo = () => {
          const sqlTestigo = `
            INSERT INTO testigo
            (nombre, apellido, telefono, id_reporte)
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            sqlTestigo,
            [nombre, apellido, telefono || null, idReporte],
            (error) => {
              if (error) {
                console.error("Error al guardar testigo:", error);

                return res.status(500).json({
                  mensaje:
                    "El reporte se guardó, pero no se pudo guardar el testigo.",
                  id_reporte: idReporte,
                  detalle: error.sqlMessage,
                });
              }

              guardarEstadistica();
            }
          );
        };

        if (hayTestigos) {
          insertarTestigo();
        } else {
          guardarEstadistica();
        }
      }
    );
  });
};


const obtenerReportes = (req, res) => {
  const sql = `
    SELECT
      r.id_reporte,
      r.descripcion,
      r.estado,
      r.fecha,
      r.hora,
      r.latitud,
      r.longitud,
      r.id_zona,
      z.nombre AS zona,
      d.nombre AS delito,
      d.nivel_delito AS riesgo
    FROM reporte r
    LEFT JOIN zona z ON r.id_zona = z.id_zona
    LEFT JOIN delito d ON r.id_delito = d.id_delito
    ORDER BY r.fecha DESC, r.hora DESC
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al obtener reportes:", error);

      return res.status(500).json({
        mensaje: "Error al obtener los reportes.",
      });
    }

    res.status(200).json(resultados);
  });
};

const obtenerUltimoReporte = (req, res) => {
  const sql = `
    SELECT
      r.id_reporte,
      r.descripcion AS titulo,
      r.direccion,
      r.fecha,
      r.hora,
      r.estado,
      z.nombre AS zona,
      z.nivel_riesgo AS nivelRiesgo
    FROM reporte r
    INNER JOIN zona z ON r.id_zona = z.id_zona
    ORDER BY r.id_reporte DESC
    LIMIT 1
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al obtener el último reporte:", error);

      return res.status(500).json({
        mensaje: "Error al obtener el último reporte.",
        detalle: error.message,
      });
    }

    if (resultados.length === 0) {
      return res.status(404).json({
        mensaje: "No hay reportes registrados.",
      });
    }

    res.status(200).json(resultados[0]);
  });
};

const actualizarReporte = (req, res) => {
  const { id } = req.params;
  const { descripcion, estado } = req.body;

  if (!descripcion || !estado) {
    return res.status(400).json({
      mensaje: "La descripción y el estado son obligatorios.",
    });
  }

  const estadosPermitidos = ["Pendiente", "En revisión", "Resuelto"];

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      mensaje: "El estado indicado no es válido.",
    });
  }

  const sql = `
    UPDATE reporte
    SET descripcion = ?, estado = ?
    WHERE id_reporte = ?
  `;

  db.query(sql, [descripcion, estado, id], (error, resultado) => {
    if (error) {
      console.error("Error al actualizar reporte:", error);

      return res.status(500).json({
        mensaje: "Error al actualizar el reporte.",
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el reporte.",
      });
    }

    res.status(200).json({
      mensaje: "Reporte actualizado correctamente.",
    });
  });
};

const eliminarReporte = (req, res) => {
  const { id } = req.params;

  const sqlBuscar = `
    SELECT
      id_zona,
      id_delito,
      DATE_FORMAT(fecha, '%Y-%m-%d') AS periodo
    FROM reporte
    WHERE id_reporte = ?
  `;

  db.query(sqlBuscar, [id], (error, reportes) => {
    if (error) {
      console.error("Error al buscar reporte:", error);

      return res.status(500).json({
        mensaje: "Error al buscar el reporte.",
      });
    }

    if (reportes.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el reporte.",
      });
    }

    const reporte = reportes[0];

    const sqlEliminar = `
      DELETE FROM reporte
      WHERE id_reporte = ?
    `;

    db.query(sqlEliminar, [id], (error) => {
      if (error) {
        console.error("Error al eliminar reporte:", error);

        return res.status(500).json({
          mensaje: "Error al eliminar el reporte.",
        });
      }

      const sqlDescontar = `
        UPDATE estadistica
        SET
          cantidad_delitos = cantidad_delitos - 1,
          fecha_actualizacion = CURDATE()
        WHERE id_zona = ?
          AND id_delito = ?
          AND periodo = ?
      `;

      db.query(
        sqlDescontar,
        [reporte.id_zona, reporte.id_delito, reporte.periodo],
        (error) => {
          if (error) {
            console.error("Error al descontar estadística:", error);

            return res.status(500).json({
              mensaje:
                "El reporte se eliminó, pero no se pudo actualizar la estadística.",
              detalle: error.sqlMessage,
            });
          }

          const sqlLimpiar = `
            DELETE FROM estadistica
            WHERE cantidad_delitos <= 0
          `;

          db.query(sqlLimpiar, (error) => {
            if (error) {
              console.error("Error al limpiar estadística:", error);
            }

            res.status(200).json({
              mensaje: "Reporte eliminado y estadística actualizada.",
            });
          });
        },
      );
    });
  });
};

module.exports = {
  agregarReporte,
  obtenerReportes,
  obtenerUltimoReporte,
  actualizarReporte,
  eliminarReporte,
};
