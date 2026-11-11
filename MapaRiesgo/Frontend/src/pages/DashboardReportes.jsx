
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:3000/api/reportes";

const colorRiesgo = {
  Alto: "bg-red-500",
  Medio: "bg-yellow-400",
  Bajo: "bg-green-400",
};

const letraRiesgo = {
  Alto: "A",
  Medio: "M",
  Bajo: "B",
};

const colorEstado = {
  Pendiente: "bg-yellow-400",
  "En revisión": "bg-blue-400",
  Resuelto: "bg-green-400",
};

const normalizarRiesgo = (riesgo) => {
  const valor = String(riesgo || "").trim().toLowerCase();

  if (valor === "alta" || valor === "alto") return "Alto";
  if (valor === "media" || valor === "medio") return "Medio";
  if (valor === "baja" || valor === "bajo") return "Bajo";

  return riesgo || "Bajo";
};

function DashboardReportes() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroZona, setFiltroZona] = useState("");
  const [filtroRiesgo, setFiltroRiesgo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [seleccionados, setSeleccionados] = useState([]);
  const [editando, setEditando] = useState(null);
  const [viendo, setViendo] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const reportesPorPagina = 8;

  function formatearFecha(fecha, hora) {
    if (!fecha) return "-";

    const fechaFormateada = new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });

    return hora
      ? `${fechaFormateada} · ${String(hora).slice(0, 5)}`
      : fechaFormateada;
  }

  const obtenerReportes = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(API);

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los reportes.");
      }

      const datos = await respuesta.json();

      const reportesAdaptados = datos.map((reporte) => ({
        id: reporte.id_reporte,
        titulo: reporte.descripcion,
        zona: reporte.zona || "Sin zona",
        delito: reporte.delito || "Sin especificar",
        riesgo: normalizarRiesgo(reporte.riesgo),
        estado: reporte.estado,
        fecha: reporte.fecha,
        hora: reporte.hora,
        cuando: formatearFecha(reporte.fecha, reporte.hora),
      }));

      setReportes(reportesAdaptados);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los reportes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerReportes();
  }, []);

  const pendientes = reportes.filter(
    (reporte) => reporte.estado === "Pendiente"
  ).length;

  const resueltos = reportes.filter(
    (reporte) => reporte.estado === "Resuelto"
  ).length;

  const enRevision = reportes.filter(
    (reporte) => reporte.estado === "En revisión"
  ).length;

  const reportesAlto = reportes.filter(
    (reporte) => reporte.riesgo === "Alto"
  ).length;

  const cards = [
    {
      titulo: "Total de reportes",
      numero: reportes.length,
      detalle: "Reportes registrados",
      icono: "bi-file-earmark-text",
      color: "text-blue-400",
      fondo: "bg-blue-500/10",
      borde: "hover:border-blue-500/30",
    },
    {
      titulo: "Pendientes",
      numero: pendientes,
      detalle: "Esperando revisión",
      icono: "bi-clock-history",
      color: "text-yellow-400",
      fondo: "bg-yellow-500/10",
      borde: "hover:border-yellow-500/30",
    },
    {
      titulo: "En revisión",
      numero: enRevision,
      detalle: "Bajo evaluación",
      icono: "bi-search",
      color: "text-sky-400",
      fondo: "bg-sky-500/10",
      borde: "hover:border-sky-500/30",
    },
    {
      titulo: "Resueltos",
      numero: resueltos,
      detalle: "Reportes solucionados",
      icono: "bi-check-circle",
      color: "text-emerald-400",
      fondo: "bg-emerald-500/10",
      borde: "hover:border-emerald-500/30",
    },
  ];

  const zonas = [
    ...new Set(reportes.map((reporte) => reporte.zona).filter(Boolean)),
  ];

  const reportesFiltrados = useMemo(() => {
    return reportes.filter((reporte) => {
      const coincideBusqueda =
        reporte.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(reporte.id).includes(busqueda);

      const coincideZona =
        filtroZona === "" || reporte.zona === filtroZona;

      const coincideRiesgo =
        filtroRiesgo === "" ||
        normalizarRiesgo(reporte.riesgo) === filtroRiesgo;

      const coincideEstado =
        filtroEstado === "" || reporte.estado === filtroEstado;

      return (
        coincideBusqueda &&
        coincideZona &&
        coincideRiesgo &&
        coincideEstado
      );
    });
  }, [reportes, busqueda, filtroZona, filtroRiesgo, filtroEstado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(reportesFiltrados.length / reportesPorPagina)
  );

  const reportesPaginados = reportesFiltrados.slice(
    (paginaActual - 1) * reportesPorPagina,
    paginaActual * reportesPorPagina
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroZona, filtroRiesgo, filtroEstado]);

  const seleccionarReporte = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const seleccionarTodos = (e) => {
    const idsPagina = reportesPaginados.map((reporte) => reporte.id);

    if (e.target.checked) {
      setSeleccionados((prev) => [
        ...new Set([...prev, ...idsPagina]),
      ]);
    } else {
      setSeleccionados((prev) =>
        prev.filter((id) => !idsPagina.includes(id))
      );
    }
  };

  const eliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este reporte?"
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo eliminar el reporte.");
      }

      setReportes((prev) =>
        prev.filter((reporte) => reporte.id !== id)
      );

      setSeleccionados((prev) =>
        prev.filter((item) => item !== id)
      );

      if (viendo?.id === id) setViendo(null);
      if (editando?.id === id) setEditando(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await fetch(`${API}/${editando.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion: editando.titulo,
          estado: editando.estado,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo actualizar el reporte.");
      }

      setReportes((prev) =>
        prev.map((reporte) =>
          reporte.id === editando.id
            ? {
                ...reporte,
                titulo: editando.titulo,
                estado: editando.estado,
              }
            : reporte
        )
      );

      setEditando(null);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-blue-400">
            <i className="bi bi-clipboard-data-fill"></i>
            <span className="text-[11px] font-bold uppercase tracking-[2px]">
              Administración
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Gestión de reportes
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Supervisá, filtrá y administrá los reportes de zonas de riesgo.
          </p>
        </div>

        <button
          type="button"
          onClick={obtenerReportes}
          disabled={cargando}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300 disabled:opacity-50"
        >
          <i className={`bi bi-arrow-clockwise ${cargando ? "animate-spin" : ""}`}></i>
          Actualizar lista
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.titulo}
            className={`rounded-xl border border-white/10 bg-white/[0.03] p-5 transition ${card.borde}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {card.titulo}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {card.numero}
                </h2>

                <p className={`mt-1 text-[11px] ${card.color}`}>
                  {card.detalle}
                </p>
              </div>

              <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${card.fondo} ${card.color}`}>
                <i className={`bi ${card.icono}`}></i>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03]">

        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              Lista de reportes
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Consultá y administrá los reportes registrados.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className={`h-2 w-2 rounded-full ${error ? "bg-red-400" : cargando ? "bg-yellow-400" : "bg-emerald-400"}`}></span>
            {error ? "Error de conexión" : cargando ? "Consultando API..." : "API conectada"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-white/10 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input
              type="text"
              placeholder="Buscar por título o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filtroZona}
            onChange={(e) => setFiltroZona(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#172536] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="">Todas las zonas</option>
            {zonas.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>

          <select
            value={filtroRiesgo}
            onChange={(e) => setFiltroRiesgo(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#172536] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="">Todos los niveles de riesgo</option>
            <option value="Alto">Riesgo alto</option>
            <option value="Medio">Riesgo medio</option>
            <option value="Bajo">Riesgo bajo</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#172536] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En revisión">En revisión</option>
            <option value="Resuelto">Resuelto</option>
          </select>
        </div>

        {seleccionados.length > 0 && (
          <div className="flex items-center justify-between border-b border-blue-500/20 bg-blue-500/[0.07] px-5 py-3">
            <p className="text-xs text-blue-300">
              <i className="bi bi-check2-square mr-2"></i>
              {seleccionados.length} reportes seleccionados
            </p>

            <button
              type="button"
              onClick={() => setSeleccionados([])}
              className="text-[11px] font-semibold text-slate-400 transition hover:text-white"
            >
              Limpiar selección
            </button>
          </div>
        )}

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500"></div>
            <p className="mt-3 text-xs text-slate-400">
              Cargando reportes...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-14">
            <i className="bi bi-exclamation-circle text-3xl text-red-400"></i>
            <p className="mt-3 text-sm text-red-400">{error}</p>

            <button
              onClick={obtenerReportes}
              className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/10"
            >
              Reintentar
            </button>
          </div>
        ) : reportesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <i className="bi bi-inbox text-4xl text-slate-500"></i>
            <p className="mt-3 text-sm font-medium text-slate-300">
              No se encontraron reportes
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Probá modificando los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-xs">

              <thead className="bg-white/[0.03]">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={
                        reportesPaginados.length > 0 &&
                        reportesPaginados.every((reporte) =>
                          seleccionados.includes(reporte.id)
                        )
                      }
                      onChange={seleccionarTodos}
                      className="h-3.5 w-3.5 cursor-pointer accent-blue-500"
                    />
                  </th>

                  <th className="px-3 py-4 font-semibold">ID</th>
                  <th className="px-3 py-4 font-semibold">Reporte</th>
                  <th className="px-3 py-4 font-semibold">Zona</th>
                  <th className="px-3 py-4 font-semibold">Riesgo</th>
                  <th className="px-3 py-4 font-semibold">Estado</th>
                  <th className="px-3 py-4 font-semibold">Fecha</th>
                  <th className="px-5 py-4 text-right font-semibold">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {reportesPaginados.map((reporte) => (
                  <tr
                    key={reporte.id}
                    className={`border-t border-white/[0.06] transition hover:bg-white/[0.025] ${
                      seleccionados.includes(reporte.id) ? "bg-blue-500/[0.04]" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(reporte.id)}
                        onChange={() => seleccionarReporte(reporte.id)}
                        className="h-3.5 w-3.5 cursor-pointer accent-blue-500"
                      />
                    </td>

                    <td className="px-3 py-4 font-semibold text-slate-500">
                      #{reporte.id}
                    </td>

                    <td className="max-w-[220px] px-3 py-4">
                      <span className="block truncate font-semibold text-slate-200">
                        {reporte.titulo}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-slate-400">
                      {reporte.zona}
                    </td>

                    <td className="px-3 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${colorRiesgo[reporte.riesgo] || "bg-gray-400"}`}></span>
                        {reporte.riesgo}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${colorEstado[reporte.estado] || "bg-gray-400"}`}></span>
                        {reporte.estado}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-400">
                      {reporte.cuando}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="Ver reporte"
                          onClick={() => setViendo(reporte)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        <button
                          type="button"
                          title="Editar reporte"
                          onClick={() => setEditando({ ...reporte })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          title="Eliminar reporte"
                          onClick={() => eliminar(reporte.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!cargando && !error && reportesFiltrados.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-300">
                {(paginaActual - 1) * reportesPorPagina + 1}-
                {Math.min(
                  paginaActual * reportesPorPagina,
                  reportesFiltrados.length
                )}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-300">
                {reportesFiltrados.length}
              </span>{" "}
              reportes
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                <button
                  key={pagina}
                  type="button"
                  onClick={() => setPaginaActual(pagina)}
                  className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-semibold transition ${
                    paginaActual === pagina
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {pagina}
                </button>
              ))}

              <button
                type="button"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((prev) => prev + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </section>

      {viendo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setViendo(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#111b2b] shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-base font-bold text-white">
                  Detalle del reporte
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Información del reporte #{viendo.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViendo(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Descripción
                </p>
                <p className="text-sm leading-relaxed text-slate-200">
                  {viendo.titulo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Delito
                  </p>
                  <p className="text-xs text-slate-300">{viendo.delito}</p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Zona
                  </p>
                  <p className="text-xs text-slate-300">{viendo.zona}</p>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Riesgo
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300">
                    <span className={`h-2 w-2 rounded-full ${colorRiesgo[viendo.riesgo] || "bg-gray-400"}`}></span>
                    {viendo.riesgo}
                  </span>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Estado
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300">
                    <span className={`h-2 w-2 rounded-full ${colorEstado[viendo.estado] || "bg-gray-400"}`}></span>
                    {viendo.estado}
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Fecha y hora
                </p>
                <p className="text-xs text-slate-300">{viendo.cuando}</p>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={() => setViendo(null)}
                className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setEditando(null)}
        >
          <form
            onSubmit={guardar}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#111b2b] shadow-2xl shadow-black/40"
          >
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="text-base font-bold text-white">
                Editar reporte
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Modificá la descripción y el estado del reporte #{editando.id}.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Descripción
                </label>

                <textarea
                  value={editando.titulo || ""}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      titulo: e.target.value,
                    })
                  }
                  required
                  rows="4"
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Nivel de riesgo
                </label>

                <input
                  type="text"
                  value={editando.riesgo || ""}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Estado del reporte
                </label>

                <select
                  value={editando.estado}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      estado: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#172536] px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En revisión">En revisión</option>
                  <option value="Resuelto">Resuelto</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-4">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
              >
                <i className="bi bi-check2"></i>
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default DashboardReportes;
