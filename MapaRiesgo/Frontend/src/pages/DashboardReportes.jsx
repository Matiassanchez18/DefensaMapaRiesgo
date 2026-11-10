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

  const cards = [
    {
      titulo: "Total de reportes",
      numero: reportes.length,
      detalle: "Reportes registrados",
      color: "text-muted",
    },
    {
      titulo: "Pendientes",
      numero: pendientes,
      detalle: "Esperando revisión",
      color: "text-yellow-400",
    },
    {
      titulo: "En revisión",
      numero: enRevision,
      detalle: "Bajo evaluación",
      color: "text-blue-400",
    },
    {
      titulo: "Resueltos",
      numero: resueltos,
      detalle: "Reportes solucionados",
      color: "text-green-400",
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
    <>
      <h1 className="text-xl font-bold">Reportes</h1>

      <p className="mb-5 text-xs text-muted">
        Gestión de reportes de zonas de riesgo
      </p>

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

      <section className="mt-3 rounded-lg border border-line bg-white/5 p-4">
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
            {zonas.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
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
                  <input
                    type="checkbox"
                    checked={
                      reportesPaginados.length > 0 &&
                      reportesPaginados.every((reporte) =>
                        seleccionados.includes(reporte.id)
                      )
                    }
                    onChange={seleccionarTodos}
                  />
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
              {cargando ? (
                <tr className="border-t border-line">
                  <td colSpan="8" className="py-6 text-center text-muted">
                    Cargando reportes...
                  </td>
                </tr>
              ) : error ? (
                <tr className="border-t border-line">
                  <td colSpan="8" className="py-6 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              ) : (
                <>
                  {reportesPaginados.map((reporte) => (
                    <tr
                      key={reporte.id}
                      className="border-t border-line"
                    >
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(reporte.id)}
                          onChange={() => seleccionarReporte(reporte.id)}
                        />
                      </td>

                      <td className="py-3 text-muted">
                        #{reporte.id}
                      </td>

                      <td className="max-w-[220px] py-3 font-bold">
                        <span className="block truncate">
                          {reporte.titulo}
                        </span>
                      </td>

                      <td className="py-3">{reporte.zona}</td>

                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              colorRiesgo[reporte.riesgo] || "bg-gray-400"
                            }`}
                          ></span>
                          {letraRiesgo[reporte.riesgo] || "-"} ·{" "}
                          {reporte.riesgo}
                        </span>
                      </td>

                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              colorEstado[reporte.estado] || "bg-gray-400"
                            }`}
                          ></span>
                          {reporte.estado}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-3 text-muted">
                        {reporte.cuando}
                      </td>

                      {/* ACCIONES */}
                      <td className="py-3">
                        <div className="flex justify-end gap-3 text-sm">
                          <button
                            type="button"
                            title="Ver reporte"
                            onClick={() => setViendo(reporte)}
                            className="text-muted hover:text-white"
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          <button
                            type="button"
                            title="Editar reporte"
                            onClick={() => setEditando({ ...reporte })}
                            className="text-muted hover:text-white"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            title="Eliminar reporte"
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
                      <td
                        colSpan="8"
                        className="py-6 text-center text-muted"
                      >
                        No se encontraron reportes
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-[11px] text-muted">
          <span>
            {reportesFiltrados.length === 0
              ? "Mostrando 0 reportes"
              : `Mostrando ${
                  (paginaActual - 1) * reportesPorPagina + 1
                }-${Math.min(
                  paginaActual * reportesPorPagina,
                  reportesFiltrados.length
                )} de ${reportesFiltrados.length}`}
          </span>

          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => prev - 1)}
              className="rounded-md border border-line px-2.5 py-1 disabled:opacity-30"
            >
              ‹
            </button>

            {Array.from(
              { length: totalPaginas },
              (_, i) => i + 1
            ).map((pagina) => (
              <button
                key={pagina}
                type="button"
                onClick={() => setPaginaActual(pagina)}
                className={`rounded-md px-2.5 py-1 ${
                  paginaActual === pagina
                    ? "bg-blue-500 text-white"
                    : "border border-line"
                }`}
              >
                {pagina}
              </button>
            ))}

            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((prev) => prev + 1)}
              className="rounded-md border border-line px-2.5 py-1 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {viendo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-line bg-sidebar p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                Reporte #{viendo.id}
              </h2>

              <button
                type="button"
                onClick={() => setViendo(null)}
                className="text-muted hover:text-white"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[11px] text-muted">Descripción</p>
                <p>{viendo.titulo}</p>
              </div>

              <div>
                <p className="text-[11px] text-muted">Delito</p>
                <p>{viendo.delito}</p>
              </div>

              <div>
                <p className="text-[11px] text-muted">Zona</p>
                <p>{viendo.zona}</p>
              </div>

              <div>
                <p className="text-[11px] text-muted">Riesgo</p>
                <p>{viendo.riesgo}</p>
              </div>

              <div>
                <p className="text-[11px] text-muted">Estado</p>
                <p>{viendo.estado}</p>
              </div>

              <div>
                <p className="text-[11px] text-muted">Fecha</p>
                <p>{viendo.cuando}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViendo(null)}
              className="mt-5 w-full rounded-md bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={guardar}
            className="w-full max-w-sm rounded-lg border border-line bg-sidebar p-5"
          >
            <h2 className="mb-4 text-sm font-bold">
              Editar reporte #{editando.id}
            </h2>

            <p className="mb-1 text-[11px] text-muted">Descripción</p>

            <textarea
              value={editando.titulo || ""}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  titulo: e.target.value,
                })
              }
              required
              rows="3"
              className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            />

            <p className="mb-1 text-[11px] text-muted">Riesgo</p>

            <input
              type="text"
              value={editando.riesgo || ""}
              disabled
              className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs text-muted"
            />

            <p className="mb-1 text-[11px] text-muted">Estado</p>

            <select
              value={editando.estado}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  estado: e.target.value,
                })
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
