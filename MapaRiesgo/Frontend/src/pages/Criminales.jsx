import { useState, useEffect } from "react";
import CriminalCard from "../components/CriminalCard";
import CriminalForm from "../components/CriminalForm";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const API_URL = "http://localhost:3000/api/criminales";

function Criminales() {
  const [criminales, setCriminales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState(null); // null = se está creando uno nuevo

  const obtenerCriminales = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error("Error al obtener criminales");
      }

      const datos = await respuesta.json();
      setCriminales(datos);
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudieron cargar los criminales.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCriminales();
  }, []);

  const abrirCrear = () => {
    setEditando(null);
    setFormAbierto(true);
  };

  const abrirEditar = (criminal) => {
    setEditando(criminal);
    setFormAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormAbierto(false);
    setEditando(null);
  };

const guardar = async (datos) => {
  const esEdicion = Boolean(editando);
  const url = esEdicion ? `${API_URL}/${editando.id_criminal}` : API_URL;

  try {
    const respuesta = await fetch(url, {
      method: esEdicion ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      return {
        mensaje: resultado.mensaje || "Error al guardar el criminal",
        errores: resultado.errores || [],
      };
    }

    cerrarFormulario();
    await obtenerCriminales();

    await Swal.fire({
      icon: "success",
      title: esEdicion ? "¡Criminal modificado!" : "¡Criminal agregado!",
      text: esEdicion
        ? "Los datos se actualizaron correctamente."
        : "El criminal fue agregado correctamente.",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#2563eb",
      background: "#151e30",
      color: "#ffffff",
    });

    return null;

  } catch (error) {
    console.error("Error:", error);

    return {
      mensaje:
        "No se pudo conectar con el servidor. Probá de nuevo en unos minutos.",
      errores: [],
    };
  }
};

  const eliminar = async (criminal) => {
  const confirmar = await Swal.fire({
    title: "¿Eliminar criminal?",
    text: `¿Estás seguro de que querés eliminar a ${criminal.nombre} ${criminal.apellido}? Esta acción no se puede deshacer.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#475569",
    background: "#151e30",
    color: "#ffffff",
    reverseButtons: true,
  });

  if (!confirmar.isConfirmed) return;

  try {
    const respuesta = await fetch(`${API_URL}/${criminal.id_criminal}`, {
      method: "DELETE",
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "Error al eliminar el criminal");
    }

    setCriminales((anteriores) =>
      anteriores.filter((c) => c.id_criminal !== criminal.id_criminal),
    );

    await Swal.fire({
      icon: "success",
      title: "¡Criminal eliminado!",
      text: "El registro fue eliminado correctamente.",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#2563eb",
      background: "#151e30",
      color: "#ffffff",
    });

  } catch (error) {
    console.error("Error:", error);

    Swal.fire({
      icon: "error",
      title: "Error al eliminar",
      text: error.message,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#dc2626",
      background: "#151e30",
      color: "#ffffff",
    });
  }
};

  const totalBuscados = criminales.filter((c) => c.estado === "Buscado").length;
  const totalCapturados = criminales.filter(
    (c) => c.estado === "Capturado",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-blue-400">
            <i className="bi bi-incognito"></i>
            <span className="text-[11px] font-bold uppercase tracking-[2px]">
              Administración
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Gestión de criminales
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Administrá el registro de criminales buscados y capturados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={abrirCrear}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
          >
            <i className="bi bi-plus-lg"></i>
            Agregar criminal
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Total de criminales
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {criminales.length}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Registros en la base de datos
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
              <i className="bi bi-incognito"></i>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Buscados</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {totalBuscados}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Con orden de captura vigente
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl text-red-400">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-500/30 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Capturados</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {totalCapturados}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Ya fueron detenidos
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-400">
              <i className="bi bi-shield-fill-check"></i>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              Lista de criminales
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Información almacenada en la base de datos.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${error ? "bg-red-400" : cargando ? "bg-yellow-400" : "bg-emerald-400"}`}
            ></span>
            {error
              ? "Error de conexión"
              : cargando
                ? "Consultando API..."
                : "API conectada"}
          </div>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500"></div>
            <p className="mt-3 text-xs text-slate-400">
              Cargando criminales...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-14">
            <i className="bi bi-exclamation-circle text-3xl text-red-400"></i>
            <p className="mt-3 text-sm text-red-400">{error}</p>

            <button
              onClick={obtenerCriminales}
              className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/10"
            >
              Reintentar
            </button>
          </div>
        ) : criminales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <i className="bi bi-incognito text-4xl text-slate-500"></i>
            <p className="mt-3 text-sm font-medium text-slate-300">
              No hay criminales registrados
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Agregá el primero con el botón «Agregar criminal».
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {criminales.map((criminal) => (
              <CriminalCard
                key={criminal.id_criminal}
                criminal={criminal}
                onEditar={abrirEditar}
                onEliminar={eliminar}
              />
            ))}
          </div>
        )}

        {!cargando && !error && criminales.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <p className="text-[11px] text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-300">
                {criminales.length}
              </span>{" "}
              criminales
            </p>

            <p className="text-[11px] text-slate-500">
              <i className="bi bi-database mr-1"></i>
              MySQL
            </p>
          </div>
        )}
      </section>

      {formAbierto && (
        <CriminalForm
          criminal={editando}
          onCancelar={cerrarFormulario}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}

export default Criminales;
