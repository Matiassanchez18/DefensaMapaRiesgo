function DashboardAdmin() {
  const cards = [
    {
      titulo: "Reportes totales",
      numero: "268",
      detalle: "+12% vs. semana anterior",
      color: "text-green-400",
    },
    {
      titulo: "Zonas monitoreadas",
      numero: "18",
      detalle: "3 con riesgo alto",
      color: "text-red-400",
    },
    {
      titulo: "Pendientes de revisión",
      numero: "42",
      detalle: "Requieren atención",
      color: "text-yellow-400",
    },
    {
      titulo: "Usuarios activos",
      numero: "1.254",
      detalle: "+4% vs. mes anterior",
      color: "text-green-400",
    },
  ];

  const zonas = [
    {
      nombre: "Zona Norte",
      cantidad: 86,
      ancho: "w-[90%]",
      color: "bg-red-400",
    },
    {
      nombre: "Zona Centro",
      cantidad: 64,
      ancho: "w-[67%]",
      color: "bg-yellow-500",
    },
    {
      nombre: "Zona Sur",
      cantidad: 47,
      ancho: "w-[49%]",
      color: "bg-yellow-500",
    },
    {
      nombre: "Zona Este",
      cantidad: 31,
      ancho: "w-[33%]",
      color: "bg-green-500",
    },
    {
      nombre: "Zona Oeste",
      cantidad: 22,
      ancho: "w-[23%]",
      color: "bg-green-500",
    },
  ];

  const circulos = [
    {
      id: 1,
      estilo: "left-[20%] top-[15%] h-14 w-14 border-red-400 bg-red-400/30",
    },
    {
      id: 2,
      estilo: "left-[68%] top-[45%] h-9 w-9 border-yellow-500 bg-yellow-500/30",
    },
    {
      id: 3,
      estilo: "left-[45%] top-[72%] h-6 w-6 border-green-500 bg-green-500/30",
    },
  ];

  const reportes = [
    {
      id: "#1042",
      titulo: "Incidente de alto riesgo en Av. Belgrano",
      zona: "Zona Norte",
      riesgo: "A · Alto",
      colorRiesgo: "bg-red-400",
      estado: "Pendiente",
      colorEstado: "bg-yellow-500",
      cuando: "hace 20 min",
    },
    {
      id: "1041",
      titulo: "[TÍTULO DEL REPORTE]",
      zona: "Zona Sur",
      riesgo: "B · Medio",
      colorRiesgo: "bg-yellow-500",
      estado: "En revisión",
      colorEstado: "bg-blue-400",
      cuando: "hace 1 h",
    },
    {
      id: "1040",
      titulo: "[TÍTULO DEL REPORTE]",
      zona: "Zona Centro",
      riesgo: "C · Bajo",
      colorRiesgo: "bg-green-500",
      estado: "Resuelto",
      colorEstado: "bg-green-500",
      cuando: "hace 3 h",
    },
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.titulo}
            className="rounded-lg border border-line bg-white/5 p-4"
          >
            <p className="text-[11px] text-muted">{card.titulo}</p>
            <p className="my-1 text-3xl font-bold">{card.numero}</p>
            <p className={`text-[11px] ${card.color}`}>{card.detalle}</p>
          </div>
        ))}
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Reportes por zona */}
        <div className="rounded-lg border border-line bg-white/5 p-4">
          <h2 className="mb-4 border-b border-line pb-2 text-xs font-bold">
            Reportes por zona
          </h2>

          {zonas.map((zona) => (
            <div
              key={zona.nombre}
              className="mb-3 grid grid-cols-[80px_1fr_30px] items-center gap-3 text-xs"
            >
              <span className="text-muted">{zona.nombre}</span>
              <div className="h-1.5 rounded-full bg-black/30">
                <div
                  className={`h-1.5 rounded-full ${zona.ancho} ${zona.color}`}
                ></div>
              </div>
              <span className="text-right font-bold">{zona.cantidad}</span>
            </div>
          ))}
        </div>

        {/* Distribución geográfica */}
        <div className="rounded-lg border border-line bg-white/5 p-4">
          <h2 className="mb-4 border-b border-line pb-2 text-xs font-bold">
            Distribución geográfica
          </h2>

          <div className="grilla-mapa relative h-44 rounded-md border border-line bg-black/30">
            {circulos.map((circulo) => (
              <div
                key={circulo.id}
                className={`absolute rounded-full border ${circulo.estilo}`}
              ></div>
            ))}
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
              {reportes.map((reporte) => (
                <tr key={reporte.id} className="border-t border-line">
                  <td className="py-3 text-muted">{reporte.id}</td>
                  <td className="py-3 font-bold">{reporte.titulo}</td>
                  <td className="py-3">{reporte.zona}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${reporte.colorRiesgo}`}
                      ></span>
                      {reporte.riesgo}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${reporte.colorEstado}`}
                      ></span>
                      {reporte.estado}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{reporte.cuando}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default DashboardAdmin;
