
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/testigos";

function CrudTestigos() {
  const [testigos, setTestigos] = useState([]);

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    id_reporte: "",
  });

  const [idEditar, setIdEditar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const obtenerTestigos = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los testigos.");
      }

      const datos = await respuesta.json();

      setTestigos(Array.isArray(datos) ? datos : datos.testigos || []);
    } catch (error) {
      console.error("Error al obtener testigos:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerTestigos();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: "",
      apellido: "",
      telefono: "",
      id_reporte: "",
    });

    setIdEditar(null);
  };

  const guardarTestigo = async (e) => {
    e.preventDefault();

    if (
      !formulario.nombre.trim() ||
      !formulario.apellido.trim() ||
      !formulario.id_reporte
    ) {
      setError("Completá el nombre, apellido e ID del reporte.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const datos = {
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        telefono: formulario.telefono.trim() || null,
        id_reporte: Number(formulario.id_reporte),
      };

      const url = idEditar
        ? `${API_URL}/${idEditar}`
        : API_URL;

      const metodo = idEditar ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detalle ||
          resultado.mensaje ||
          "No se pudo guardar el testigo."
        );
      }

      limpiarFormulario();
      await obtenerTestigos();
    } catch (error) {
      console.error("Error al guardar testigo:", error);
      setError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const editarTestigo = (testigo) => {
    setFormulario({
      nombre: testigo.nombre || "",
      apellido: testigo.apellido || "",
      telefono: testigo.telefono || "",
      id_reporte: String(testigo.id_reporte || ""),
    });

    setIdEditar(testigo.id_testigo);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const eliminarTestigo = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés eliminar este testigo?"
    );

    if (!confirmar) return;

    try {
      setError("");

      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        const resultado = await respuesta.json();

        throw new Error(
          resultado.detalle ||
          resultado.mensaje ||
          "No se pudo eliminar el testigo."
        );
      }

      await obtenerTestigos();
    } catch (error) {
      console.error("Error al eliminar testigo:", error);
      setError(error.message);
    }
  };

  const testigosFiltrados = testigos.filter((testigo) => {
    const texto = busqueda.toLowerCase();

    return (
      testigo.nombre?.toLowerCase().includes(texto) ||
      testigo.apellido?.toLowerCase().includes(texto) ||
      String(testigo.id_testigo).includes(texto) ||
      String(testigo.id_reporte).includes(texto)
    );
  });

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-bold">Gestión de testigos</h1>
        <p className="mt-1 text-xs text-muted">
          Administrá los testigos asociados a los reportes.
        </p>
      </div>

      <section className="rounded-lg border border-line bg-white/5 p-4">

        <h2 className="mb-4 border-b border-line pb-3 text-sm font-bold">
          {idEditar ? "Editar testigo" : "Registrar testigo"}
        </h2>

        <form onSubmit={guardarTestigo} className="space-y-4">

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <div>
              <label className="mb-1 block text-xs text-muted">
                Nombre
              </label>

              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                maxLength={100}
                placeholder="Nombre del testigo"
                className="w-full rounded-md border border-line bg-black/20 p-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Apellido
              </label>

              <input
                type="text"
                name="apellido"
                value={formulario.apellido}
                onChange={manejarCambio}
                maxLength={100}
                placeholder="Apellido del testigo"
                className="w-full rounded-md border border-line bg-black/20 p-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Teléfono
              </label>

              <input
                type="tel"
                name="telefono"
                value={formulario.telefono}
                onChange={manejarCambio}
                maxLength={20}
                placeholder="Teléfono de contacto"
                className="w-full rounded-md border border-line bg-black/20 p-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                ID del reporte
              </label>

              <input
                type="number"
                name="id_reporte"
                value={formulario.id_reporte}
                onChange={manejarCambio}
                min="1"
                placeholder="Ej: 25"
                className="w-full rounded-md border border-line bg-black/20 p-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </div>

          </div>

          {error && (
            <p className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">

            <button
              type="submit"
              disabled={guardando}
              className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : idEditar
                  ? "Guardar cambios"
                  : "Registrar testigo"}
            </button>

            {idEditar && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-md border border-line px-4 py-2 text-xs font-bold text-muted hover:bg-white/10"
              >
                Cancelar edición
              </button>
            )}

          </div>
        </form>
      </section>

      <section className="rounded-lg border border-line bg-white/5 p-4">

        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-sm font-bold">Testigos registrados</h2>

            <p className="mt-1 text-xs text-muted">
              Total: {testigos.length} testigos
            </p>
          </div>

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar testigo..."
            className="rounded-md border border-line bg-black/20 px-3 py-2 text-xs outline-none focus:border-blue-500"
          />

        </div>

        {cargando ? (
          <p className="py-6 text-center text-xs text-muted">
            Cargando testigos...
          </p>
        ) : testigosFiltrados.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">
            No se encontraron testigos.
          </p>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-wider text-muted">
                  <th className="py-3">ID</th>
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Apellido</th>
                  <th className="py-3">Teléfono</th>
                  <th className="py-3">ID Reporte</th>
                  <th className="py-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {testigosFiltrados.map((testigo) => (

                  <tr
                    key={testigo.id_testigo}
                    className="border-b border-line last:border-0"
                  >
                    <td className="py-3 text-muted">
                      #{testigo.id_testigo}
                    </td>

                    <td className="py-3 font-semibold">
                      {testigo.nombre}
                    </td>

                    <td className="py-3">
                      {testigo.apellido}
                    </td>

                    <td className="py-3 text-muted">
                      {testigo.telefono || "Sin teléfono"}
                    </td>

                    <td className="py-3">
                      #{testigo.id_reporte}
                    </td>

                    <td className="py-3">
                      <div className="flex justify-center gap-2">

                        <button
                          type="button"
                          onClick={() => editarTestigo(testigo)}
                          className="rounded-md bg-blue-500/10 px-3 py-1.5 text-blue-400 hover:bg-blue-500/20"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            eliminarTestigo(testigo.id_testigo)
                          }
                          className="rounded-md bg-red-500/10 px-3 py-1.5 text-red-400 hover:bg-red-500/20"
                        >
                          Eliminar
                        </button>

                      </div>
                    </td>
                  </tr>

                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>
    </div>
  );
}

export default CrudTestigos;
