const db = require("../Config/db");

const obtenerEstadisticas = async (req, res) => {
  try {
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

    const consultaDelitos = `
      SELECT
        d.nombre AS nombre,
        SUM(e.cantidad_delitos) AS cantidad
      FROM estadistica e
      INNER JOIN delito d ON e.id_delito = d.id_delito
      GROUP BY d.id_delito, d.nombre
      ORDER BY cantidad DESC
    `;

   const consultaRobosPorDia = `
  SELECT
    CASE DAYOFWEEK(STR_TO_DATE(e.periodo, '%Y-%m-%d'))
      WHEN 1 THEN 'Domingo'
      WHEN 2 THEN 'Lunes'
      WHEN 3 THEN 'Martes'
      WHEN 4 THEN 'Miércoles'
      WHEN 5 THEN 'Jueves'
      WHEN 6 THEN 'Viernes'
      WHEN 7 THEN 'Sábado'
    END AS dia,
    SUM(e.cantidad_delitos) AS cantidad
  FROM estadistica e
  GROUP BY DAYOFWEEK(STR_TO_DATE(e.periodo, '%Y-%m-%d'))
  ORDER BY FIELD(
    DAYOFWEEK(STR_TO_DATE(e.periodo, '%Y-%m-%d')),
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
        SUM(e.cantidad_delitos) AS cantidad
      FROM estadistica e
      INNER JOIN zona z ON e.id_zona = z.id_zona
      GROUP BY z.id_zona, z.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `;

    const consultaVariacionRobos = `
      SELECT
        (
          SELECT COALESCE(SUM(e.cantidad_delitos), 0)
          FROM estadistica e
          INNER JOIN delito d ON e.id_delito = d.id_delito
          WHERE LOWER(d.nombre) LIKE '%robo%'
            AND STR_TO_DATE(e.periodo, '%Y-%m-%d')
              BETWEEN DATE_SUB(
                CURDATE(),
                INTERVAL DAY(CURDATE()) - 1 DAY
              )
              AND CURDATE()
        ) AS actual,

        (
          SELECT COALESCE(SUM(e.cantidad_delitos), 0)
          FROM estadistica e
          INNER JOIN delito d ON e.id_delito = d.id_delito
          WHERE LOWER(d.nombre) LIKE '%robo%'
            AND STR_TO_DATE(e.periodo, '%Y-%m-%d')
              BETWEEN
                DATE_SUB(
                  DATE_SUB(
                    CURDATE(),
                    INTERVAL DAY(CURDATE()) - 1 DAY
                  ),
                  INTERVAL 1 MONTH
                )
              AND LEAST(
                DATE_ADD(
                  DATE_SUB(
                    DATE_SUB(
                      CURDATE(),
                      INTERVAL DAY(CURDATE()) - 1 DAY
                    ),
                    INTERVAL 1 MONTH
                  ),
                  INTERVAL DAY(CURDATE()) - 1 DAY
                ),
                LAST_DAY(
                  DATE_SUB(
                    DATE_SUB(
                      CURDATE(),
                      INTERVAL DAY(CURDATE()) - 1 DAY
                    ),
                    INTERVAL 1 MONTH
                  )
                )
              )
        ) AS anterior
    `;

    const [
      delitos,
      robosPorDia,
      usuariosPorMes,
      zonas,
      resultadoVariacion,
    ] = await Promise.all([
      ejecutarConsulta(consultaDelitos),
      ejecutarConsulta(consultaRobosPorDia),
      ejecutarConsulta(consultaUsuariosPorMes),
      ejecutarConsulta(consultaZonas),
      ejecutarConsulta(consultaVariacionRobos),
    ]);

    const actual = Number(resultadoVariacion[0].actual);
    const anterior = Number(resultadoVariacion[0].anterior);

    let porcentaje = 0;

    if (anterior > 0) {
      porcentaje = Math.round(
        ((actual - anterior) / anterior) * 100
      );
    } else if (actual > 0) {
      porcentaje = null;
    }

    res.status(200).json({
      delitos,
      robosPorDia,
      usuariosPorMes,
      zonas,
      variacionRobos: {
        actual,
        anterior,
        porcentaje,
      },
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