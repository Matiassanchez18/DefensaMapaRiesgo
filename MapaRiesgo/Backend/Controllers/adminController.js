const db = require("../Config/db");

const obtenerDashboard = (req, res) => {
  const consultaEstadisticas = `
    SELECT
      (SELECT COUNT(*) FROM reporte) AS reportesTotales,
      (SELECT COUNT(*) FROM zona) AS zonasMonitoreadas,
      (SELECT COUNT(*) FROM zona
       WHERE nivel_riesgo = 'Alto') AS zonasRiesgoAlto,
      (SELECT COUNT(*) FROM reporte
       WHERE estado = 'Pendiente') AS pendientes,
      (SELECT COUNT(*) FROM usuario) AS usuariosActivos
  `;

  db.query(consultaEstadisticas, (error, estadisticas) => {
    if (error) {
      console.error("Error en estadísticas:", error);
      return res.status(500).json({
        mensaje: "Error al obtener las estadísticas."
      });
    }

    const consultaZonas = `
      SELECT
        z.id_zona,
        z.nombre,
        COUNT(r.id_reporte) AS cantidad
      FROM zona z
      LEFT JOIN reporte r ON z.id_zona = r.id_zona
      GROUP BY z.id_zona, z.nombre
      ORDER BY cantidad DESC
      LIMIT 5
    `;

    db.query(consultaZonas, (error, zonas) => {
      if (error) {
        console.error("Error en zonas:", error);
        return res.status(500).json({
          mensaje: "Error al obtener las zonas."
        });
      }

      const consultaReportes = `
        SELECT
          r.id_reporte,
          r.descripcion,
          r.estado,
          r.fecha,
          r.hora,
          z.nombre AS zona,
          d.nombre AS delito,
          d.nivel_delito AS riesgo
        FROM reporte r
        LEFT JOIN zona z ON r.id_zona = z.id_zona
        LEFT JOIN delito d ON r.id_delito = d.id_delito
        ORDER BY r.fecha DESC, r.hora DESC
        LIMIT 5
      `;

      db.query(consultaReportes, (error, reportes) => {
        if (error) {
          console.error("Error en reportes:", error);
          return res.status(500).json({
            mensaje: "Error al obtener los reportes."
          });
        }

        res.status(200).json({
          estadisticas: estadisticas[0],
          zonas,
          reportes
        });
      });
    });
  });
};

module.exports = { obtenerDashboard };