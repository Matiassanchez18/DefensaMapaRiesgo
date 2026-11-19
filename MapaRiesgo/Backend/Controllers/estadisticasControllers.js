const db = require("../Config/db");

const obtenerEstadisticas = async (req, res) => {
  try {
    const consultaDelitos = `
      SELECT
        d.nombre AS nombre,
        COUNT(r.id_reporte) AS cantidad
      FROM delito d
      INNER JOIN reporte r ON d.id_delito = r.id_delito
      GROUP BY d.id_delito, d.nombre
      ORDER BY cantidad DESC
    `;

    const consultaRobosPorDia = `
      SELECT
        CASE DAYOFWEEK(r.fecha)
          WHEN 1 THEN 'Domingo'
          WHEN 2 THEN 'Lunes'
          WHEN 3 THEN 'Martes'
          WHEN 4 THEN 'Miércoles'
          WHEN 5 THEN 'Jueves'
          WHEN 6 THEN 'Viernes'
          WHEN 7 THEN 'Sábado'
        END AS dia,
        COUNT(r.id_reporte) AS cantidad
      FROM reporte r
      INNER JOIN delito d ON r.id_delito = d.id_delito
      WHERE LOWER(d.nombre) LIKE '%robo%'
      GROUP BY DAYOFWEEK(r.fecha)
      ORDER BY FIELD(
        DAYOFWEEK(r.fecha),
        2, 3, 4, 5, 6, 7, 1
      )
    `;

    const consultaUsuariosPorMes = `
      SELECT
        DATE_FORMAT(fecha_registro, '%Y-%m') AS periodo,
        COUNT(id_usuario) AS cantidad
      FROM usuario
      WHERE fecha_registro IS NOT NULL
      GROUP BY DATE_FORMAT(fecha_registro, '%Y-%m')
      ORDER BY periodo ASC
    `;

    const consultaZonas = `
      SELECT
        z.nombre AS nombre,
        COUNT(r.id_reporte) AS cantidad
      FROM zona z
      INNER JOIN reporte r ON z.id_zona = r.id_zona
      GROUP BY z.id_zona, z.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `;

    const ejecutarConsulta = (sql) => {
      return new Promise((resolve, reject) => {
        db.query(sql, (error, resultados) => {
          if (error) {
            reject(error);
          } else {
            resolve(resultados);
          }
        });
      });
    };

    const [delitos, robosPorDia, usuariosPorMes, zonas] =
      await Promise.all([
        ejecutarConsulta(consultaDelitos),
        ejecutarConsulta(consultaRobosPorDia),
        ejecutarConsulta(consultaUsuariosPorMes),
        ejecutarConsulta(consultaZonas),
      ]);

    res.status(200).json({
      delitos,
      robosPorDia,
      usuariosPorMes,
      zonas,
    });

  } catch (error) {
    console.error(
      "ERROR EN ESTADÍSTICAS:",
      error.sqlMessage || error
    );

    res.status(500).json({
      mensaje: "Error al obtener las estadísticas",
      detalle: error.sqlMessage || error.message,
    });
  }
};

module.exports = { obtenerEstadisticas };