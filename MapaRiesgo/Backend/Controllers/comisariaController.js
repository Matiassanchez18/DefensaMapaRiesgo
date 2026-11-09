const db = require("../Config/db");

const obtenerComisarias = (req, res) => {
  const sql = `
    SELECT
      id_comisaria,
      nombre,
      direccion,
      telefono,
      latitud,
      longitud,
      tipo,
      localidad
    FROM comisaria
    WHERE latitud IS NOT NULL
      AND longitud IS NOT NULL
    ORDER BY nombre ASC
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al obtener dependencias:", error);
      return res.status(500).json({
        mensaje: "Error al obtener las dependencias policiales",
      });
    }

    res.status(200).json(resultados);
  });
};

module.exports = {
  obtenerComisarias,
};