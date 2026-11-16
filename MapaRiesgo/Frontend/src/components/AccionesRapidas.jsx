
import { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/Home.css";
import LlamadoEmergencia from "./LlamadoEmergencia";
import useAuthStore from "../store/Store";

function AccionesRapidas() {
  const usuario = useAuthStore((state) => state.usuario);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const API_URL = "http://10.0.2.2:3000/api/contactos-emergencia";

  // OBTENER CONTACTOS
  const obtenerContactos = async () => {
    if (!usuario?.id_usuario) return;

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(
        `${API_URL}/${usuario.id_usuario}`
      );

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

  // ABRIR MODAL
  const abrirModal = () => {
    setMostrarModal(true);
    obtenerContactos();
  };

  // MODIFICAR CONTACTO
  const modificarContacto = async (contacto) => {
    try {
      const respuesta = await fetch(
        `${API_URL}/${contacto.id_contacto}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario: usuario.id_usuario,
            nombre: contacto.nombre,
            telefono: contacto.telefono,
            relacion: contacto.relacion,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo modificar.");
      }

      setEditando(null);
      setMensaje("Contacto modificado exitosamente.");
      obtenerContactos();
    } catch (error) {
      console.error("Error:", error);
      setMensaje(error.message);
    }
  };

  // ELIMINAR CONTACTO
  const eliminarContacto = async (id_contacto) => {
    const confirmar = window.confirm(
      "¿Estás segura de que querés eliminar este contacto?"
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        `${API_URL}/${id_contacto}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario: usuario.id_usuario,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo eliminar.");
      }

      setMensaje("Contacto eliminado exitosamente.");
      obtenerContactos();
    } catch (error) {
      console.error("Error:", error);
      setMensaje(error.message);
    }
  };

  // ACTUALIZAR CAMPO DEL CONTACTO EN EDICIÓN
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

      {/* MODAL DE CONTACTOS */}
      {mostrarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => {
            setMostrarModal(false);
            setEditando(null);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-gray-700 bg-[#1b2b3a] p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ENCABEZADO */}
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

            {/* MENSAJES */}
            {mensaje && (
              <p className="mb-3 rounded-md border border-gray-600 bg-[#263b4d] p-3 text-sm text-white">
                {mensaje}
              </p>
            )}

            {/* ESTADOS DE CARGA Y LISTADO */}
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
                    className="rounded-lg border border-gray-600 bg-[#263b4d] p-4"
                  >
                    {editando?.id_contacto === contacto.id_contacto ? (
                      /* FORMULARIO DE EDICIÓN */
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
                            className="mt-1 w-full rounded-md border border-gray-600 bg-[#1b2b3a] p-2 text-white placeholder-gray-300 outline-none focus:border-blue-500"
                          />
                        </label>

                        <label className="block text-sm font-medium text-white">
                          Teléfono
                          <input
                            type="text"
                            value={editando.telefono}
                            onChange={(e) =>
                              actualizarCampo("telefono", e.target.value)
                            }
                            placeholder="Ingresá el teléfono"
                            className="mt-1 w-full rounded-md border border-gray-600 bg-[#1b2b3a] p-2 text-white placeholder-gray-300 outline-none focus:border-blue-500"
                          />
                        </label>

                        <label className="block text-sm font-medium text-white">
                          Relación
                          <input
                            type="text"
                            value={editando.relacion}
                            onChange={(e) =>
                              actualizarCampo("relacion", e.target.value)
                            }
                            placeholder="Ej: Familiar, amigo..."
                            className="mt-1 w-full rounded-md border border-gray-600 bg-[#1b2b3a] p-2 text-white placeholder-gray-300 outline-none focus:border-blue-500"
                          />
                        </label>

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
                      /* INFORMACIÓN DEL CONTACTO */
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
                            onClick={() => setEditando({ ...contacto })}
                            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                          >
                            Modificar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarContacto(contacto.id_contacto)
                            }
                            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                          >
                            Eliminar
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
