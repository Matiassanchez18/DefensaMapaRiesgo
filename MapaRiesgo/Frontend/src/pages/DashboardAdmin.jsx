import { useEffect, useState } from "react";

function DashboardAdmin() {
  const [datos, setDatos] = useState({
    estadisticas: {
      reportesTotales: 0,
      zonasMonitoreadas: 0,
      zonasRiesgoAlto: 0,
      pendientes: 0,
      usuariosActivos: 0,
    },
    zonas: [],
    reportes: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/reportes/dashboard"
        );

        if (!respuesta.ok) {
          const resultadoError = await respuesta.json();

          throw new Error(
            resultadoError.detalle || resultadoError.mensaje
          );
        }

        const resultado = await respuesta.json();

        setDatos(resultado);
      } catch (error) {
        console.error("Error en el Dashboard:", error);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []);

  const { estadisticas, zonas, reportes } = datos;

  const cards = [
    {
      titulo: "Reportes totales",
      numero: estadisticas.reportesTotales,
      detalle: "Total de reportes registrados",
      color: "text-green-400",
    },
    {
      titulo: "Zonas monitoreadas",
      numero: estadisticas.zonasMonitoreadas,
      detalle: `${estadisticas.zonasRiesgoAlto} con riesgo alto`,
      color: "text-red-400",
    },
    {
      titulo: "Pendientes de revisión",
      numero: estadisticas.pendientes,
      detalle: "Requieren atención",
      color: "text-yellow-400",
    },
    {
      titulo: "Usuarios activos",
      numero: estadisticas.usuariosActivos,
      detalle: "Usuarios registrados",
      color: "text-green-400",
    },
  ];

  const mayorCantidad = Math.max(
    ...zonas.map((zona) => Number(zona.cantidad)),
    1
  );

  const coloresRiesgo = {
    Alta: "bg-red-400",
    Media: "bg-yellow-500",
    Baja: "bg-green-500",
  };

  const coloresEstado = {
    Pendiente: "bg-yellow-500",
    "En revisión": "bg-blue-400",
    Resuelto: "bg-green-500",
  };

  if (cargando) {
    return (
      <div className="p-6 text-center text-muted">
        Cargando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Dashboard</h1>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.titulo}
            className="rounded-lg border border-line bg-white/5 p-4"
          >
            <p className="text-[11px] text-muted">{card.titulo}</p>

            <p className="my-1 text-3xl font-bold">{card.numero}</p>

            <p className={`text-[11px] ${card.color}`}>
              {card.detalle}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-white/5 p-4">
          <h2 className="mb-4 border-b border-line pb-2 text-xs font-bold">
            Reportes por zona
          </h2>

          {zonas.length === 0 ? (
            <p className="text-xs text-muted">
              No hay zonas registradas.
            </p>
          ) : (
            zonas.map((zona) => (
              <div
                key={zona.id_zona}
                className="mb-3 grid grid-cols-[80px_1fr_30px] items-center gap-3 text-xs"
              >
                <span className="text-muted">{zona.nombre}</span>

                <div className="h-1.5 rounded-full bg-black/30">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{
                      width: `${
                        (Number(zona.cantidad) / mayorCantidad) * 100
                      }%`,
                    }}
                  />
                </div>

                <span className="text-right font-bold">
                  {zona.cantidad}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="rounded-lg border border-line bg-white/5 p-4">
          <h2 className="mb-4 border-b border-line pb-2 text-xs font-bold">
            Distribución geográfica
          </h2>

          <div className="grilla-mapa relative h-44 rounded-md border border-line bg-black/30">
            <p className="absolute inset-0 flex items-center justify-center text-xs text-muted">
              Próximamente: mapa con zonas y coordenadas reales.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-lg border border-line bg-white/5 p-4">
        <h2 className="mb-2 border-b border-line pb-2 text-xs font-bold">
          Últimos reportes
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                <th className="py-2 font-semibold">ID</th>
                <th className="py-2 font-semibold">Reporte</th>
                <th className="py-2 font-semibold">Zona</th>
                <th className="py-2 font-semibold">Riesgo</th>
                <th className="py-2 font-semibold">Estado</th>
                <th className="py-2 font-semibold">Cuándo</th>
              </tr>
            </thead>

            <tbody>
              {reportes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-muted">
                    No hay reportes registrados.
                  </td>
                </tr>
              ) : (
                reportes.map((reporte) => (
                  <tr
                    key={reporte.id_reporte}
                    className="border-t border-line"
                  >
                    <td className="py-3 text-muted">
                      #{reporte.id_reporte}
                    </td>

                    <td className="py-3 font-bold">
                      {reporte.descripcion}
                    </td>

                    <td className="py-3">
                      {reporte.zona || "Sin zona"}
                    </td>

                    <td className="py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            coloresRiesgo[reporte.riesgo] || "bg-gray-400"
                          }`}
                        />

                        {reporte.riesgo || "Sin clasificar"}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            coloresEstado[reporte.estado] || "bg-gray-400"
                          }`}
                        />

                        {reporte.estado}
                      </span>
                    </td>

                    <td className="py-3 text-muted">
                      {reporte.fecha} {reporte.hora}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default DashboardAdmin;