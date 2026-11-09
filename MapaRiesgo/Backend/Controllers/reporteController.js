const db = require("../Config/db");

const agregarReporte = (req, res) => {
  const { id_delito, direccion, descripcion, testigos } = req.body;

  const sql = `
    INSERT INTO reporte
    (id_usuario, id_delito, id_zona, fecha, hora, descripcion, estado, testigos, direccion)
    VALUES (?, ?, ?, CURDATE(), CURTIME(), ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [1, id_delito, 1, descripcion, "Pendiente", testigos, direccion],
    (error, resultado) => {
      if (error) {
        console.error("Código:", error.code);
        console.error("Mensaje SQL:", error.sqlMessage);
        console.error("Consulta:", error.sql);

        return res.status(500).json({
          mensaje: "Error al guardar el reporte",
          detalle: error.sqlMessage,
        });
      }

      res.status(201).json({
        mensaje: "Reporte guardado correctamente",
        id_reporte: resultado.insertId,
      });
    },
  );
};

module.exports = {
  agregarReporte,
};
