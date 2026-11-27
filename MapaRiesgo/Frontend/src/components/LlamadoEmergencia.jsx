import { useState } from "react";
import useAuthStore from "../store/Store";
import "../style/Home.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function LlamadoEmergencia() {
  const usuario = useAuthStore((state) => state.usuario);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [errores, setErrores] = useState({});

  const [nuevoContacto, setNuevoContacto] = useState({
    nombre: "",
    telefono: "",
    relacion: "",
  });

  const validarCampo = (name, value) => {
    const valor = value.trim();

    const regexTexto = /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u;

    if (name === "nombre") {
      if (!valor) return "El nombre es obligatorio.";
      if (valor.length < 2) return "Debe tener al menos 2 caracteres.";
      if (valor.length > 100) return "No puede superar los 100 caracteres.";

      if (!regexTexto.test(valor)) {
        return "Solo se permiten letras, espacios, guiones y apóstrofes.";
      }
    }

    if (name === "telefono") {
      if (!valor) return "El teléfono es obligatorio.";

      if (!/^\d{10}$/.test(valor)) {
        return "El teléfono debe tener exactamente 10 números.";
      }
    }

    if (name === "relacion") {
      if (!valor) return "La relación es obligatoria.";
      if (valor.length < 2) return "Debe tener al menos 2 caracteres.";
      if (valor.length > 50) return "No puede superar los 50 caracteres.";

      if (!regexTexto.test(valor)) {
        return "Solo se permiten letras, espacios, guiones y apóstrofes.";
      }
    }

    return "";
  };

  const claseInput = (campo) =>
    `w-full rounded-md border ${
      errores[campo]
        ? "!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500"
        : "border-gray-300 focus:border-blue-500"
    }`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nuevoValor = value;

    if (name === "telefono") {
      nuevoValor = value.replace(/\D/g, "").slice(0, 10);
    }

    setNuevoContacto((anterior) => ({
      ...anterior,
      [name]: nuevoValor,
    }));

    setErrores((anteriores) => ({
      ...anteriores,
      [name]: validarCampo(name, nuevoValor),
    }));

    setError("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarCampo("nombre", nuevoContacto.nombre),
      telefono: validarCampo("telefono", nuevoContacto.telefono),
      relacion: validarCampo("relacion", nuevoContacto.relacion),
    };

    setErrores(nuevosErrores);

    return !Object.values(nuevosErrores).some(Boolean);
  };

  
const agregarContacto = async (e) => {
  e.preventDefault();

  setError("");

  if (!usuario?.id_usuario) {
    setError("Debés iniciar sesión para guardar un contacto.");
    return;
  }

  if (!validarFormulario()) return;

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
          nombre: nuevoContacto.nombre.trim(),
          telefono: nuevoContacto.telefono,
          relacion: nuevoContacto.relacion.trim(),
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

    setErrores({});
    setGuardado(true);

    await Swal.fire({
      title: "¡Contacto agregado!",
      text: "El contacto de emergencia se guardó correctamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
      background: "#151e30",
      color: "#ffffff",
      confirmButtonColor: "#2563eb",
    });

  } catch (error) {
    console.error("Error al guardar contacto:", error);

    setError(error.message || "Error de conexión con el servidor.");

    Swal.fire({
      title: "Error",
      text: error.message || "No se pudo guardar el contacto.",
      icon: "error",
      confirmButtonText: "Aceptar",
      background: "#151e30",
      color: "#ffffff",
      confirmButtonColor: "#dc2626",
    });

  } finally {
    setCargando(false);
  }
};


  const cargarOtroContacto = () => {
    setGuardado(false);
    setError("");
    setErrores({});
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setGuardado(false);
    setError("");
    setErrores({});

    setNuevoContacto({
      nombre: "",
      telefono: "",
      relacion: "",
    });
  };

  return (
    <div className="llamado-emergencia relative ">
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
          noValidate
        >
          <h3>Nuevo contacto</h3>

          <label htmlFor="nombre">Nombre completo</label>

          <input
            id="nombre"
            type="text"
            name="nombre"
            value={nuevoContacto.nombre}
            onChange={handleChange}
            maxLength={100}
            placeholder="Nombre del contacto"
            className={claseInput("nombre")}
            required
          />

          {errores.nombre && (
            <p className="contacto-emergencia-error">
              <i className="bi bi-exclamation-circle-fill"></i> {errores.nombre}
            </p>
          )}

          <label htmlFor="telefono">Teléfono</label>

          <input
            id="telefono"
            type="text"
            inputMode="numeric"
            name="telefono"
            value={nuevoContacto.telefono}
            onChange={handleChange}
            placeholder="Ej: 3811234567"
            maxLength={10}
            className={claseInput("telefono")}
            required
          />

          <span className="block mt-1 text-xs text-gray-300">
            Ingresá un número de 10 dígitos.
          </span>

          {errores.telefono && (
            <p className="contacto-emergencia-error">
              <i className="bi bi-exclamation-circle-fill"></i>{" "}
              {errores.telefono}
            </p>
          )}

          <label htmlFor="relacion">Relación</label>

          <input
            id="relacion"
            type="text"
            name="relacion"
            value={nuevoContacto.relacion}
            onChange={handleChange}
            maxLength={50}
            placeholder="Ej: Familiar, amigo..."
            className={claseInput("relacion")}
            required
          />

          {errores.relacion && (
            <p className="contacto-emergencia-error">
              <i className="bi bi-exclamation-circle-fill"></i>{" "}
              {errores.relacion}
            </p>
          )}

          {error && <p className="contacto-emergencia-error">{error}</p>}

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
