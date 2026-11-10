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
  `;

  db.query(sql, (error, resultado) => {
    if (error) {
      console.error("Error al obtener dependencias policiales:", error);
      return res.status(500).json({
        mensaje: "Error al obtener las dependencias policiales",
      });
    }

    res.json(resultado);
  });
};

module.exports = { obtenerComisarias };