
const db = require("../Config/db");

const obtenerDelitos = (req, res) => {
  const consulta = "SELECT * FROM delito";

  db.query(consulta, (error, resultados) => {
    if (error) {
      return res.status(500).json({ mensaje: "Error al obtener delitos" });
    }

    res.json(resultados);
  });
};

const agregarDelito = (req, res) => {
  const { nombre, descripcion, nivel_gravedad } = req.body;

  const consulta = `
    INSERT INTO delito (nombre, descripcion, nivel_gravedad)
    VALUES (?, ?, ?)
  `;

  db.query(
    consulta,
    [nombre, descripcion, nivel_gravedad],
    (error, resultado) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al agregar el delito",
        });
      }

      res.status(201).json({
        mensaje: "Delito agregado correctamente",
        id_delito: resultado.insertId,
      });
    }
  );
};

module.exports = { obtenerDelitos, agregarDelito };
