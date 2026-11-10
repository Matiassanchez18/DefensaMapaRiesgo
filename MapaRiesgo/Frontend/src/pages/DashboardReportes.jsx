import { useState } from "react";

const reportesIniciales = [
  {
    id: 1042,
    titulo: "Incidente de alto riesgo en Av. Belgrano",
    zona: "Zona Norte",
    riesgo: "Alto",
    estado: "Pendiente",
    cuando: "hace 20 min",
  },
  {
    id: 1041,
    titulo: "[TÍTULO DEL REPORTE]",
    zona: "Zona Sur",
    riesgo: "Medio",
    estado: "En revisión",
    cuando: "hace 1 h",
  },
  {
    id: 1040,
    titulo: "[TÍTULO DEL REPORTE]",
    zona: "Zona Centro",
    riesgo: "Bajo",
    estado: "Resuelto",
    cuando: "hace 3 h",
  },
  {
    id: 1039,
    titulo: "[TÍTULO DEL REPORTE]",
    zona: "Zona Este",
    riesgo: "Medio",
    estado: "Resuelto",
    cuando: "ayer",
  },
  {
    id: 1038,
    titulo: "[TÍTULO DEL REPORTE]",
    zona: "Zona Oeste",
    riesgo: "Alto",
    estado: "En revisión",
    cuando: "ayer",
  },
  {
    id: 1037,
    titulo: "[TÍTULO DEL REPORTE]",
    zona: "Zona Norte",
    riesgo: "Bajo",
    estado: "Resuelto",
    cuando: "hace 2 días",
  },
];

const letraRiesgo = { Alto: "A", Medio: "B", Bajo: "C" };
const colorRiesgo = {
  Alto: "bg-red-400",
  Medio: "bg-yellow-500",
  Bajo: "bg-green-500",
};
const colorEstado = {
  Pendiente: "bg-yellow-500",
  "En revisión": "bg-blue-400",
  Resuelto: "bg-green-500",
};

function DashboardReportes() {
  const [reportes, setReportes] = useState(reportesIniciales);
  const [editando, setEditando] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroZona, setFiltroZona] = useState("");
  const [filtroRiesgo, setFiltroRiesgo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const cards = [
    {
      titulo: "Reportes totales",
      numero: "268",
      detalle: "+12% vs. semana anterior",
      color: "text-green-400",
    },
    {
      titulo: "Pendientes",
      numero: "42",
      detalle: "Requieren atención",
      color: "text-yellow-400",
    },
    {
      titulo: "En revisión",
      numero: "31",
      detalle: "Asignados a moderadores",
      color: "text-blue-400",
    },
    {
      titulo: "Resueltos",
      numero: "195",
      detalle: "+8% vs. semana anterior",
      color: "text-green-400",
    },
  ];

  const reportesFiltrados = reportes.filter((reporte) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      reporte.titulo.toLowerCase().includes(texto) ||
      String(reporte.id).includes(texto);

    const coincideZona = filtroZona === "" || reporte.zona === filtroZona;
    const coincideRiesgo =
      filtroRiesgo === "" || reporte.riesgo === filtroRiesgo;
    const coincideEstado =
      filtroEstado === "" || reporte.estado === filtroEstado;

    return coincideBusqueda && coincideZona && coincideRiesgo && coincideEstado;
  });

  const eliminar = (id) => {
    if (window.confirm("¿Seguro que querés eliminar este reporte?")) {
      setReportes(reportes.filter((reporte) => reporte.id !== id));
    }
  };

  const guardar = (e) => {
    e.preventDefault();
    setReportes(
      reportes.map((reporte) =>
        reporte.id === editando.id ? editando : reporte,
      ),
    );
    setEditando(null);
  };

  return (
    <>
      <h1 className="text-xl font-bold">Reportes</h1>
      <p className="mb-5 text-xs text-muted">
        Gestión de reportes de zonas de riesgo
      </p>

      {/* Cards */}
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

      {/* Tabla de reportes */}
      <section className="mt-3 rounded-lg border border-line bg-white/5 p-4">
        {/* Filtros */}
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Buscar por título o ID"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
          />
          <select
            value={filtroZona}
            onChange={(e) => setFiltroZona(e.target.value)}
            className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
          >
            <option value="">Todas las zonas</option>
            <option value="Zona Norte">Zona Norte</option>
            <option value="Zona Centro">Zona Centro</option>
            <option value="Zona Sur">Zona Sur</option>
            <option value="Zona Este">Zona Este</option>
            <option value="Zona Oeste">Zona Oeste</option>
          </select>
          <select
            value={filtroRiesgo}
            onChange={(e) => setFiltroRiesgo(e.target.value)}
            className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
          >
            <option value="">Todo el riesgo</option>
            <option value="Alto">Alto</option>
            <option value="Medio">Medio</option>
            <option value="Bajo">Bajo</option>
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En revisión">En revisión</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                <th className="py-2">
                  <input type="checkbox" />
                </th>
                <th className="py-2 font-semibold">ID</th>
                <th className="py-2 font-semibold">Reporte</th>
                <th className="py-2 font-semibold">Zona</th>
                <th className="py-2 font-semibold">Riesgo</th>
                <th className="py-2 font-semibold">Estado</th>
                <th className="py-2 font-semibold">Cuándo</th>
                <th className="py-2 text-right font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {reportesFiltrados.map((reporte) => (
                <tr key={reporte.id} className="border-t border-line">
                  <td className="py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="py-3 text-muted">#{reporte.id}</td>
                  <td className="py-3 font-bold">{reporte.titulo}</td>
                  <td className="py-3">{reporte.zona}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${colorRiesgo[reporte.riesgo]}`}
                      ></span>
                      {letraRiesgo[reporte.riesgo]} · {reporte.riesgo}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${colorEstado[reporte.estado]}`}
                      ></span>
                      {reporte.estado}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{reporte.cuando}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-3 text-sm">
                      <button
                        type="button"
                        className="text-muted hover:text-white"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditando(reporte)}
                        className="text-muted hover:text-white"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(reporte.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {reportesFiltrados.length === 0 && (
                <tr className="border-t border-line">
                  <td colSpan="8" className="py-6 text-center text-muted">
                    No se encontraron reportes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
          <span>Mostrando 1-{reportesFiltrados.length} de 268</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              className="rounded-md border border-line px-2.5 py-1"
            >
              ‹
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-500 px-2.5 py-1 text-white"
            >
              1
            </button>
            <button
              type="button"
              className="rounded-md border border-line px-2.5 py-1"
            >
              2
            </button>
            <button
              type="button"
              className="rounded-md border border-line px-2.5 py-1"
            >
              3
            </button>
            <button
              type="button"
              className="rounded-md border border-line px-2.5 py-1"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* Formulario de edición */}
      {editando && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={guardar}
            className="w-full max-w-sm rounded-lg border border-line bg-sidebar p-5"
          >
            <h2 className="mb-4 text-sm font-bold">
              Editar reporte #{editando.id}
            </h2>

            <p className="mb-1 text-[11px] text-muted">Título</p>
            <input
              type="text"
              value={editando.titulo}
              onChange={(e) =>
                setEditando({ ...editando, titulo: e.target.value })
              }
              className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            />

            <p className="mb-1 text-[11px] text-muted">Riesgo</p>
            <select
              value={editando.riesgo}
              onChange={(e) =>
                setEditando({ ...editando, riesgo: e.target.value })
              }
              className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            >
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>

            <p className="mb-1 text-[11px] text-muted">Estado</p>
            <select
              value={editando.estado}
              onChange={(e) =>
                setEditando({ ...editando, estado: e.target.value })
              }
              className="mb-4 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En revisión">En revisión</option>
              <option value="Resuelto">Resuelto</option>
            </select>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="rounded-md border border-line px-3 py-1.5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-500 px-3 py-1.5 font-semibold text-white"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default DashboardReportes;
