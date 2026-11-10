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
    </>
  );
}

export default DashboardAdmin;
