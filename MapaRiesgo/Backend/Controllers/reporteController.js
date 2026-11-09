
const db = require("../Config/db");


const agregarReporte = (req, res) => {
const {
  id_delito,
  direccion,
  descripcion,
  testigos,
  latitud,
  longitud,
} = req.body;

  console.log("Coordenadas recibidas:", latitud, longitud);

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
      1,
      descripcion,
      latitud,
      longitud,
      "Pendiente",
      testigos,
      direccion,
    ],
    (error, resultado) => {
      if (error) {
        console.error("Error SQL:", error);

        return res.status(500).json({
          mensaje: "Error al guardar el reporte",
          detalle: error.sqlMessage,
        });
      }

      res.status(201).json({
        mensaje: "Reporte guardado correctamente",
        id_reporte: resultado.insertId,
      });
    }
  );
};

const obtenerReportes = (req, res) => {
  const sql = `
    SELECT
      id_reporte,
      id_delito,
      latitud,
      longitud,
      descripcion,
      fecha,
      hora,
      estado
    FROM reporte
    WHERE latitud IS NOT NULL
      AND longitud IS NOT NULL
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al obtener reportes:", error);

      return res.status(500).json({
        mensaje: "Error al obtener los reportes",
        detalle: error.sqlMessage,
      });
    }

    res.status(200).json(resultados);
  });
};

module.exports = {
  agregarReporte,
  obtenerReportes,
};
