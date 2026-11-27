
import { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/Home.css";
import LlamadoEmergencia from "./LlamadoEmergencia";
import useAuthStore from "../store/Store";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function AccionesRapidas() {
  const usuario = useAuthStore((state) => state.usuario);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  const API_URL = "http://localhost:3000/api/contactos-emergencia";

  const configurarZIndexSwal = () => {
    const contenedor = document.querySelector(".swal2-container");

    if (contenedor) {
      contenedor.style.zIndex = "100001";
    }
  };

  const obtenerContactos = async () => {
    if (!usuario?.id_usuario) return;

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`${API_URL}/${usuario.id_usuario}`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al obtener contactos.");
      }

      setContactos(datos);
    } catch (error) {
      console.error("Error:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = () => {
    setMostrarModal(true);
    obtenerContactos();
  };

  const modificarContacto = async (contacto) => {
    const numero = String(contacto.telefono ?? "").replace(/\D/g, "");

    if (numero.length !== 10) {
      setMensaje("El teléfono debe tener exactamente 10 números.");
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/${contacto.id_contacto}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          nombre: contacto.nombre,
          telefono: numero,
          relacion: contacto.relacion,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo modificar.");
      }

      setEditando(null);
      await obtenerContactos();

      Swal.fire({
        title: "¡Contacto modificado!",
        text: "Los datos se actualizaron correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        background: "#151e30",
        color: "#ffffff",
        confirmButtonColor: "#2563eb",
        didOpen: configurarZIndexSwal,
      });
    } catch (error) {
      console.error("Error:", error);

      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo modificar el contacto.",
        icon: "error",
        confirmButtonText: "Aceptar",
        background: "#151e30",
        color: "#ffffff",
        confirmButtonColor: "#dc2626",
        didOpen: configurarZIndexSwal,
      });
    }
  };

  const eliminarContacto = async (id_contacto) => {
    const confirmar = await Swal.fire({
      title: "¿Eliminar contacto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#151e30",
      color: "#ffffff",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
      didOpen: configurarZIndexSwal,
    });

    if (!confirmar.isConfirmed) return;

    setEliminandoId(id_contacto);

    try {
      const respuesta = await fetch(`${API_URL}/${id_contacto}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo eliminar.");
      }

      setContactos((anteriores) =>
        anteriores.filter(
          (contacto) => contacto.id_contacto !== id_contacto
        )
      );

      setMensaje("");

      await Swal.fire({
        title: "¡Contacto eliminado!",
        text: "El contacto se eliminó correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
        background: "#151e30",
        color: "#ffffff",
        confirmButtonColor: "#2563eb",
        didOpen: configurarZIndexSwal,
      });

    } catch (error) {
      console.error("Error:", error);

      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo eliminar el contacto.",
        icon: "error",
        confirmButtonText: "Aceptar",
        background: "#151e30",
        color: "#ffffff",
        confirmButtonColor: "#dc2626",
        didOpen: configurarZIndexSwal,
      });

    } finally {
      setEliminandoId(null);
    }
  };

  const actualizarCampo = (campo, valor) => {
    setEditando((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  return (
    <section className="acciones-rapidas">
      <Link to="/denuncia" className="accion-rapida">
        <i className="bi bi-exclamation-triangle accion-rapida-icono accion-rapida-icono--alerta"></i>
        <span className="accion-rapida-texto">Reportar hecho</span>
      </Link>

      <Link to="/Mapa" className="accion-rapida">
        <i className="bi bi-map accion-rapida-icono accion-rapida-icono--mapa"></i>
        <span className="accion-rapida-texto">Ver Mapa</span>
      </Link>

      <LlamadoEmergencia />

      {usuario && (
        <button
          type="button"
          className="accion-rapida col-span-full w-full"
          onClick={abrirModal}
        >
          <i className="bi bi-person-lines-fill accion-rapida-icono"></i>
          <span className="accion-rapida-texto">
            Ver contactos de emergencia
          </span>
        </button>
      )}

      {mostrarModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4"
          onClick={() => {
            setMostrarModal(false);
            setEditando(null);
          }}
        >
          <div
            className="relative z-[100000] max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#52677a] bg-[#1b2b3a] p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Mis contactos de emergencia
              </h2>

              <button
                type="button"
                onClick={() => {
                  setMostrarModal(false);
                  setEditando(null);
                }}
                className="text-2xl text-white hover:text-gray-300"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>

            {mensaje && (
              <p className="mb-3 rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-300">
                {mensaje}
              </p>
            )}

            {cargando ? (
              <p className="py-5 text-center text-white">
                Cargando contactos...
              </p>
            ) : contactos.length === 0 ? (
              <p className="py-5 text-center text-white">
                No tenés contactos de emergencia registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {contactos.map((contacto) => (
                  <div
                    key={contacto.id_contacto}
                    className="rounded-lg border border-[#52677a] bg-[#263b4d] p-4 shadow-md"
                  >
                    {editando?.id_contacto === contacto.id_contacto ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-white">
                          Nombre
                          <input
                            type="text"
                            value={editando.nombre}
                            onChange={(e) =>
                              actualizarCampo("nombre", e.target.value)
                            }
                            placeholder="Ingresá el nombre"
                            className="mt-1 w-full rounded-md border border-[#52677a] bg-[#1b2b3a] p-2 text-white placeholder-gray-300 outline-none focus:border-blue-500"
                          />
                        </label>

                        <label className="block text-sm font-medium text-white">
                          Teléfono
                          <input
                            type="text"
                            inputMode="numeric"
                            value={String(editando.telefono ?? "")}
                            onChange={(e) => {
                              const numero = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);

                              actualizarCampo("telefono", numero);
                            }}
                            placeholder="Ingresá 10 números"
                            maxLength={10}
                            className="mt-1 w-full rounded-md border border-[#52677a] bg-[#1b2b3a] p-2 text-white placeholder-gray-300 outline-none focus:border-blue-500"
                          />

                          <span className="mt-1 block text-xs text-gray-300">
                            {String(editando.telefono ?? "").length}/10 números
                          </span>
                        </label>

                        {/* BOTONES */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => modificarContacto(editando)}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          >
                            Guardar cambios
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditando(null)}
                            className="rounded-md bg-[#40566a] px-4 py-2 text-white hover:bg-[#506b83]"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-white">
                          {contacto.nombre}
                        </h3>

                        <p className="mt-1 text-sm text-white">
                          Relación: {contacto.relacion}
                        </p>

                        <p className="mt-1 text-sm text-white">
                          Teléfono: {contacto.telefono}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setMensaje("");
                              setEditando({
                                ...contacto,
                                telefono: String(contacto.telefono ?? "")
                                  .replace(/\D/g, "")
                                  .slice(0, 10),
                              });
                            }}
                            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                          >
                            Modificar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarContacto(contacto.id_contacto)
                            }
                            disabled={eliminandoId === contacto.id_contacto}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {eliminandoId === contacto.id_contacto
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AccionesRapidas;
