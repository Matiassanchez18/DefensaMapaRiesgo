import { useState } from "react";
import "../style/Home.css";

function LlamadoEmergencia() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [contactos, setContactos] = useState([]);

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

  const agregarContacto = (e) => {
    e.preventDefault();

    setContactos([...contactos, nuevoContacto]);

    setNuevoContacto({
      nombre: "",
      telefono: "",
      relacion: "",
    });

    setGuardado(true);
  };

  const cargarOtroContacto = () => {
    setGuardado(false);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setGuardado(false);
  };

  return (
    <div className="llamado-emergencia">
      <div className="llamado-emergencia-info">
        <i className="bi bi-person-plus-fill llamado-emergencia-icono"></i>

        <div>
          <h3 className="llamado-emergencia-titulo">Contactos de emergencia</h3>

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

          <div className="contacto-emergencia-acciones">
            <button type="submit">Guardar contacto</button>

            <button type="button" onClick={cerrarFormulario}>
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
