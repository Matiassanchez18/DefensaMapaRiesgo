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
      if (error) {
        return callback(error);
      }

      callback(null, resultado.insertId);
    },
  );
};

const agregarReporte = (req, res) => {
  const { id_delito, direccion, descripcion, testigos, latitud, longitud } =
    req.body;

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

  console.log("Coordenadas recibidas:", lat, lng);

  // Primero buscamos o creamos la zona.
  obtenerOCrearZona(lat, lng, (error, idZona) => {
    if (error) {
      console.error("Error al obtener o crear zona:", error);

      return res.status(500).json({
        mensaje: "Error al obtener o crear la zona.",
        detalle: error.sqlMessage,
      });
    }

    const sql = `
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
      sql,
      [
        1,
        id_delito,
        idZona,
        descripcion,
        lat,
        lng,
        "Pendiente",
        testigos,
        direccion,
      ],
      (error, resultado) => {
        if (error) {
          console.error("Error SQL:", error);

          return res.status(500).json({
            mensaje: "Error al guardar el reporte.",
            detalle: error.sqlMessage,
          });
        }

        res.status(201).json({
          mensaje: "Reporte guardado correctamente.",
          id_reporte: resultado.insertId,
          id_zona: idZona,
        });
      },
    );
  });
};

const obtenerReportes = (req, res) => {
  const sql = "SELECT * FROM reporte";

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error("ERROR MYSQL:", error);

      return res.status(500).json({
        mensaje: "Error al obtener reportes.",
        detalle: error.message,
      });
    }

    res.status(200).json(resultados);
  });
};

// ---
const obtenerUltimoReporte = (req, res) => {
  const sql = `SELECT
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
    LIMIT 1`;

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

module.exports = {
  agregarReporte,
  obtenerReportes,
  obtenerUltimoReporte,
};
