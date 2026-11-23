const db = require("../Config/db");
const { fotoPorDefecto } = require("../Utils/avatar");

// La fecha se pide ya formateada como texto (AAAA-MM-DD) para evitar líos de zona horaria
const COLUMNAS = `
  id_criminal,
  nombre,
  apellido,
  descripcion,
  DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
  orden_busqueda,
  estado,
  foto
`;

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

// Los campos opcionales vacíos se guardan como NULL.
// La columna foto es NOT NULL, así que si no viene una se genera una automática.
const prepararDatos = (body) => ({
  nombre: body.nombre,
  apellido: body.apellido,
  descripcion: body.descripcion || null,
  fecha_nacimiento: body.fecha_nacimiento || null,
  orden_busqueda: body.orden_busqueda || null,
  estado: body.estado,
  foto: body.foto || fotoPorDefecto(body.nombre, body.apellido),
});

// READ: todos los criminales, los más nuevos primero
const obtenerCriminales = (req, res) => {
  const sql = `
    SELECT ${COLUMNAS}
    FROM criminales_buscados
    ORDER BY id_criminal DESC
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error("ERROR MYSQL:", error);
      return res.status(500).json({
        mensaje: "Error al obtener los criminales",
      });
    }

    res.json(resultados);
  });
};

// CREATE
const crearCriminal = (req, res) => {
  const criminal = prepararDatos(req.body);

  const sql = `
    INSERT INTO criminales_buscados
      (nombre, apellido, descripcion, fecha_nacimiento, orden_busqueda, estado, foto)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      criminal.nombre,
      criminal.apellido,
      criminal.descripcion,
      criminal.fecha_nacimiento,
      criminal.orden_busqueda,
      criminal.estado,
      criminal.foto,
    ],
    (error, resultado) => {
      if (error) {
        console.error("ERROR MYSQL:", error);
        return res.status(500).json({
          mensaje: "Error al agregar el criminal",
        });
      }

      res.status(201).json({
        mensaje: "Criminal agregado correctamente",
        criminal: { id_criminal: resultado.insertId, ...criminal },
      });
    },
  );
};

// UPDATE
const modificarCriminal = (req, res) => {
  const { id } = req.params;

  if (!idValido(id)) {
    return res.status(400).json({ mensaje: "El id del criminal no es válido" });
  }

  const criminal = prepararDatos(req.body);

  const sql = `
    UPDATE criminales_buscados
    SET nombre = ?,
        apellido = ?,
        descripcion = ?,
        fecha_nacimiento = ?,
        orden_busqueda = ?,
        estado = ?,
        foto = ?
    WHERE id_criminal = ?
  `;

  db.query(
    sql,
    [
      criminal.nombre,
      criminal.apellido,
      criminal.descripcion,
      criminal.fecha_nacimiento,
      criminal.orden_busqueda,
      criminal.estado,
      criminal.foto,
      Number(id),
    ],
    (error, resultado) => {
      if (error) {
        console.error("ERROR MYSQL:", error);
        return res.status(500).json({
          mensaje: "Error al modificar el criminal",
        });
      }

      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Criminal no encontrado" });
      }

      res.json({
        mensaje: "Criminal modificado correctamente",
        criminal: { id_criminal: Number(id), ...criminal },
      });
    },
  );
};

// DELETE
const eliminarCriminal = (req, res) => {
  const { id } = req.params;

  if (!idValido(id)) {
    return res.status(400).json({ mensaje: "El id del criminal no es válido" });
  }

  const sql = "DELETE FROM criminales_buscados WHERE id_criminal = ?";

  db.query(sql, [Number(id)], (error, resultado) => {
    if (error) {
      console.error("ERROR MYSQL:", error);
      return res.status(500).json({
        mensaje: "Error al eliminar el criminal",
      });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Criminal no encontrado" });
    }

    res.json({ mensaje: "Criminal eliminado correctamente" });
  });
};

module.exports = {
  obtenerCriminales,
  crearCriminal,
  modificarCriminal,
  eliminarCriminal,
};
