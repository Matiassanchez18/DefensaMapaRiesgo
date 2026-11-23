const db = require("../Config/db");

const CAMPOS = "id_testigo, nombre, apellido, telefono, id_reporte";

// Devuelve el número si es un entero positivo; si no, null
const aEntero = (valor) => {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
};

// Mantiene reporte.testigos (0 o 1) acorde a los testigos que tiene cargados
const sincronizarReporte = (idReporte, callback) => {
  const sql = `
    UPDATE reporte
    SET testigos = EXISTS (SELECT 1 FROM testigo WHERE id_reporte = ?)
    WHERE id_reporte = ?
  `;

  db.query(sql, [idReporte, idReporte], (error) => {
    if (error) {
      console.error("Error al sincronizar el reporte:", error);
    }

    callback();
  });
};

const obtenerTestigos = (req, res) => {
  const sql = `
    SELECT ${CAMPOS}
    FROM testigo
    ORDER BY id_testigo DESC
  `;

  db.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al obtener testigos:", error);

      return res.status(500).json({
        mensaje: "Error al obtener los testigos.",
      });
    }

    res.status(200).json(resultados);
  });
};

const obtenerTestigo = (req, res) => {
  const id = aEntero(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensaje: "El ID del testigo no es válido.",
    });
  }

  const sql = `SELECT ${CAMPOS} FROM testigo WHERE id_testigo = ?`;

  db.query(sql, [id], (error, resultados) => {
    if (error) {
      console.error("Error al obtener el testigo:", error);

      return res.status(500).json({
        mensaje: "Error al obtener el testigo.",
      });
    }

    if (resultados.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el testigo.",
      });
    }

    res.status(200).json(resultados[0]);
  });
};

const crearTestigo = (req, res) => {
  const { nombre, apellido, telefono, id_reporte } = req.body;

  const sql = `
    INSERT INTO testigo (nombre, apellido, telefono, id_reporte)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [nombre, apellido, telefono || null, id_reporte],
    (error, resultado) => {
      if (error) {
        if (error.code === "ER_NO_REFERENCED_ROW_2") {
          return res.status(404).json({
            mensaje: "El reporte indicado no existe.",
          });
        }

        console.error("Error al guardar el testigo:", error);

        return res.status(500).json({
          mensaje: "Error al guardar el testigo.",
        });
      }

      sincronizarReporte(id_reporte, () => {
        res.status(201).json({
          mensaje: "Testigo guardado correctamente.",
          id_testigo: resultado.insertId,
        });
      });
    },
  );
};

const actualizarTestigo = (req, res) => {
  const id = aEntero(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensaje: "El ID del testigo no es válido.",
    });
  }

  const { nombre, apellido, telefono, id_reporte } = req.body;

  // Se busca el reporte anterior por si el testigo se pasa a otro reporte
  const sqlBuscar = "SELECT id_reporte FROM testigo WHERE id_testigo = ?";

  db.query(sqlBuscar, [id], (error, filas) => {
    if (error) {
      console.error("Error al buscar el testigo:", error);

      return res.status(500).json({
        mensaje: "Error al buscar el testigo.",
      });
    }

    if (filas.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el testigo.",
      });
    }

    const idReporteAnterior = filas[0].id_reporte;

    const sql = `
      UPDATE testigo
      SET nombre = ?, apellido = ?, telefono = ?, id_reporte = ?
      WHERE id_testigo = ?
    `;

    db.query(
      sql,
      [nombre, apellido, telefono || null, id_reporte, id],
      (error) => {
        if (error) {
          if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
              mensaje: "El reporte indicado no existe.",
            });
          }

          console.error("Error al actualizar el testigo:", error);

          return res.status(500).json({
            mensaje: "Error al actualizar el testigo.",
          });
        }

        const responder = () =>
          res.status(200).json({
            mensaje: "Testigo actualizado correctamente.",
          });

        sincronizarReporte(id_reporte, () => {
          if (idReporteAnterior === id_reporte) {
            return responder();
          }

          sincronizarReporte(idReporteAnterior, responder);
        });
      },
    );
  });
};

const eliminarTestigo = (req, res) => {
  const id = aEntero(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensaje: "El ID del testigo no es válido.",
    });
  }

  const sqlBuscar = "SELECT id_reporte FROM testigo WHERE id_testigo = ?";

  db.query(sqlBuscar, [id], (error, filas) => {
    if (error) {
      console.error("Error al buscar el testigo:", error);

      return res.status(500).json({
        mensaje: "Error al buscar el testigo.",
      });
    }

    if (filas.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontró el testigo.",
      });
    }

    const idReporte = filas[0].id_reporte;

    db.query("DELETE FROM testigo WHERE id_testigo = ?", [id], (error) => {
      if (error) {
        console.error("Error al eliminar el testigo:", error);

        return res.status(500).json({
          mensaje: "Error al eliminar el testigo.",
        });
      }

      sincronizarReporte(idReporte, () => {
        res.status(200).json({
          mensaje: "Testigo eliminado correctamente.",
        });
      });
    });
  });
};

module.exports = {
  obtenerTestigos,
  obtenerTestigo,
  crearTestigo,
  actualizarTestigo,
  eliminarTestigo,
};