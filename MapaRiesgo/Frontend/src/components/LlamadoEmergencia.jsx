
import { useState } from "react";
import useAuthStore from "../store/Store";
import "../style/Home.css";

function LlamadoEmergencia() {
  const usuario = useAuthStore((state) => state.usuario);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [nuevoContacto, setNuevoContacto] = useState({
    nombre: "",
    telefono: "",
    relacion: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNuevoContacto({
      ...nuevoContacto,
      [name]: value,
    });
  };

  const agregarContacto = async (e) => {
    e.preventDefault();

    setError("");

    if (!usuario?.id_usuario) {
      setError("Debés iniciar sesión para guardar un contacto.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/contactos-emergencia",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_usuario: usuario.id_usuario,
            nombre: nuevoContacto.nombre,
            telefono: nuevoContacto.telefono,
            relacion: nuevoContacto.relacion,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "No se pudo guardar el contacto.");
      }

      setNuevoContacto({
        nombre: "",
        telefono: "",
        relacion: "",
      });

      setGuardado(true);

    } catch (error) {
      console.error("Error al guardar contacto:", error);
      setError(error.message || "Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const cargarOtroContacto = () => {
    setGuardado(false);
    setError("");
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setGuardado(false);
    setError("");

    setNuevoContacto({
      nombre: "",
      telefono: "",
      relacion: "",
    });
  };

  return (
    <div className="llamado-emergencia">
      <div className="llamado-emergencia-info">
        <i className="bi bi-person-plus-fill llamado-emergencia-icono"></i>

        <div>
          <h3 className="llamado-emergencia-titulo">
            Contactos de emergencia
          </h3>

          <p className="llamado-emergencia-texto">
            Agregá personas de confianza para tener sus datos disponibles ante
            una emergencia.
          </p>
        </div>
      </div>

      {!mostrarFormulario && (
        <button
          type="button"
          className="llamado-emergencia-boton"
          onClick={() => setMostrarFormulario(true)}
        >
          <i className="bi bi-person-plus-fill"></i>
          Agregar contacto
        </button>
      )}

      {mostrarFormulario && !guardado && (
        <form
          className="contacto-emergencia-formulario"
          onSubmit={agregarContacto}
        >
          <h3>Nuevo contacto</h3>

          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={nuevoContacto.nombre}
            onChange={handleChange}
            placeholder="Nombre del contacto"
            required
          />

          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            type="tel"
            name="telefono"
            value={nuevoContacto.telefono}
            onChange={handleChange}
            placeholder="Ej: 3811234567"
            required
          />

          <label htmlFor="relacion">Relación</label>
          <input
            id="relacion"
            type="text"
            name="relacion"
            value={nuevoContacto.relacion}
            onChange={handleChange}
            placeholder="Ej: Familiar, amigo..."
            required
          />

          {error && (
            <p className="contacto-emergencia-error">
              {error}
            </p>
          )}

          <div className="contacto-emergencia-acciones">
            <button type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar contacto"}
            </button>

            <button
              type="button"
              onClick={cerrarFormulario}
              disabled={cargando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {guardado && (
        <div className="contacto-emergencia-exito">
          <p>
            <i className="bi bi-check-circle-fill"></i>
            Contacto guardado exitosamente.
          </p>

          <div className="contacto-emergencia-acciones">
            <button type="button" onClick={cargarOtroContacto}>
              Cargar otro contacto
            </button>

            <button type="button" onClick={cerrarFormulario}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LlamadoEmergencia;
