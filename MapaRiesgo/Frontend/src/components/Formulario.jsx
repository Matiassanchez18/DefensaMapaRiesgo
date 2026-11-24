import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Formulario.css";
import useAuthStore from "../store/Store";

function Formulario({ darValor, ubicacion, seleccionarEnMapa }) {
  const [testigo, setTestigo] = useState(false);

  const [errores, setErrores] = useState({
    nombre_testigo: "",
    apellido_testigo: "",
    telefono_testigo: "",
  });

  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const validarNombre = (valor) => {
    if (!valor.trim()) {
      return "Este campo es obligatorio.";
    }

    if (valor.trim().length < 2) {
      return "Debe tener al menos 2 caracteres.";
    }

    if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(valor.trim())) {
      return "Ingresá solamente letras.";
    }

    return "";
  };

  const validarTelefono = (valor) => {
    if (!valor.trim()) {
      return "El teléfono es obligatorio.";
    }

    if (!/^\d{10}$/.test(valor)) {
      return "El teléfono debe tener exactamente 10 dígitos.";
    }

    return "";
  };

  const manejarNombre = (e, campo) => {
    const valor = e.target.value;

    const valorFiltrado = valor.replace(/[^\p{L} '\u2019-]/gu, "");

    e.target.value = valorFiltrado;

    setErrores((prev) => ({
      ...prev,
      [campo]: validarNombre(valorFiltrado),
    }));
  };

  const manejarTelefono = (e) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 10);

    e.target.value = valor;

    setErrores((prev) => ({
      ...prev,
      telefono_testigo: validarTelefono(valor),
    }));
  };

  const ocultarModal = () => {
    darValor(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Debés iniciar sesión para cargar un reporte.");
      return;
    }

    if (!ubicacion) {
      alert("No se pudo obtener ninguna ubicación.");
      return;
    }

    const formulario = e.currentTarget;
    const datos = new FormData(formulario);

    const hayTestigos = datos.get("testigos") === "si";

    const nombreTestigo = hayTestigos
      ? String(datos.get("nombre_testigo") || "").trim()
      : null;

    const apellidoTestigo = hayTestigos
      ? String(datos.get("apellido_testigo") || "").trim()
      : null;

    const telefonoTestigo = hayTestigos
      ? String(datos.get("telefono_testigo") || "").trim()
      : null;

    if (hayTestigos) {
      const nuevosErrores = {
        nombre_testigo: validarNombre(nombreTestigo),
        apellido_testigo: validarNombre(apellidoTestigo),
        telefono_testigo: validarTelefono(telefonoTestigo),
      };

      setErrores(nuevosErrores);

      if (Object.values(nuevosErrores).some((error) => error !== "")) {
        return;
      }
    }

    const reporte = {
      id_delito: Number(datos.get("id_delito")),
      direccion: String(datos.get("direccion") || "").trim(),
      descripcion: String(datos.get("descripcion") || "").trim(),
      testigos: hayTestigos,
      nombre_testigo: nombreTestigo,
      apellido_testigo: apellidoTestigo,
      telefono_testigo: telefonoTestigo,
      latitud: Number(ubicacion[0]),
      longitud: Number(ubicacion[1]),
    };

    try {
      const respuesta = await fetch("http://localhost:3000/api/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reporte),
      });

      const resultado = await respuesta.json();

      // Token vencido o inválido: se cierra la sesión y se manda al login
      if (respuesta.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "Error al guardar el reporte.");
      }

      alert("¡Reporte guardado correctamente!");

      window.dispatchEvent(new Event("actualizarEstadisticas"));

      formulario.reset();
      setTestigo(false);
      setErrores({
        nombre_testigo: "",
        apellido_testigo: "",
        telefono_testigo: "",
      });

      ocultarModal();
    } catch (error) {
      console.error("Error al guardar el reporte:", error);
      alert(error.message);
    }
  };

  return (
    <div className="modal">
      <div className="form-reporte">
        <div className="reporte-card">
          <button
            type="button"
            className="reporte-cerrar"
            onClick={ocultarModal}
          >
            &times;
          </button>

          <div className="reporte-header">
            <h2>Realizar reporte</h2>
            <p>Completá los datos del hecho ocurrido</p>
          </div>

          <form className="reporte-form" onSubmit={handleSubmit}>
            <div className="reporte-campo">
              <label htmlFor="id_delito">Tipo de delito</label>
              <select
                id="id_delito"
                name="id_delito"
                className="reporte-input-icono"
                required
              >
                <option value="">Seleccioná un delito</option>
                <option value="1">Robo</option>
                <option value="2">Hurto</option>
                <option value="3">Asalto</option>
                <option value="4">Vandalismo</option>
                <option value="5">Otro</option>
              </select>
            </div>

            <div className="reporte-campo">
              <label htmlFor="direccion">Dirección o referencia</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                className="reporte-input-icono"
                placeholder="Ej: Calle San Martín 450"
                required
              />
            </div>

            <div className="reporte-campo">
              <label>¿Hubo testigos?</label>

              <div className="reporte-opciones">
                <label className="reporte-opcion">
                  <input
                    type="radio"
                    name="testigos"
                    value="si"
                    required
                    onChange={() => setTestigo(true)}
                  />
                  Sí
                </label>

                <label className="reporte-opcion">
                  <input
                    type="radio"
                    name="testigos"
                    value="no"
                    onChange={() => {
                      setTestigo(false);
                      setErrores({
                        nombre_testigo: "",
                        apellido_testigo: "",
                        telefono_testigo: "",
                      });
                    }}
                  />
                  No
                </label>
              </div>

              {testigo && (
                <div className="testigo-formulario">
                  <div className="testigo-header">
                    <div className="testigo-icono">
                      <i className="bi bi-person-vcard"></i>
                    </div>
                    <div>
                      <h4>Datos del testigo</h4>
                      <p>
                        Información de contacto de la persona que presenció el
                        hecho.
                      </p>
                    </div>
                  </div>

                  <div className="testigo-campos">
                    <div className="reporte-campo">
                      <label htmlFor="nombre_testigo">Nombre</label>
                      <input
                        type="text"
                        id="nombre_testigo"
                        name="nombre_testigo"
                        className="reporte-input-icono"
                        placeholder="Ej: Juan"
                        maxLength={100}
                        required
                        onChange={(e) => manejarNombre(e, "nombre_testigo")}
                      />
                      {errores.nombre_testigo && (
                        <small className="error-campo">
                          {errores.nombre_testigo}
                        </small>
                      )}
                    </div>

                    <div className="reporte-campo">
                      <label htmlFor="apellido_testigo">Apellido</label>
                      <input
                        type="text"
                        id="apellido_testigo"
                        name="apellido_testigo"
                        className="reporte-input-icono"
                        placeholder="Ej: Pérez"
                        maxLength={100}
                        required
                        onChange={(e) => manejarNombre(e, "apellido_testigo")}
                      />
                      {errores.apellido_testigo && (
                        <small className="error-campo">
                          {errores.apellido_testigo}
                        </small>
                      )}
                    </div>

                    <div className="reporte-campo">
                      <label htmlFor="telefono_testigo">
                        Teléfono de contacto
                      </label>
                      <div className="testigo-telefono">
                        <i className="bi bi-telephone"></i>
                        <input
                          type="tel"
                          id="telefono_testigo"
                          name="telefono_testigo"
                          placeholder="Ej: 3815555555"
                          required
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          onChange={manejarTelefono}
                        />
                      </div>
                      {errores.telefono_testigo && (
                        <small className="error-campo">
                          {errores.telefono_testigo}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="testigo-nota">
                    <i className="bi bi-info-circle"></i>
                    <span>
                      Estos datos permitirán identificar y contactar al testigo
                      si es necesario.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="reporte-campo">
              <label htmlFor="descripcion">Descripción del hecho</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="reporte-input-icono"
                placeholder="Contanos qué sucedió..."
                rows="4"
                required
              />
            </div>

            <div className="reporte-campo">
              <label>Ubicación del incidente</label>
              <p>
                {ubicacion
                  ? "Se utilizará tu ubicación GPS actual o el punto que marques en el mapa."
                  : "Todavía no se pudo obtener tu ubicación."}
              </p>

              <button
                type="button"
                className="reporte-input-icono"
                onClick={seleccionarEnMapa}
              >
                <i className="bi bi-geo-alt"></i>
                Seleccionar ubicación en el mapa
              </button>
            </div>

            <div className="reporte-acciones">
              <button
                type="button"
                className="reporte-btn-cancelar"
                onClick={ocultarModal}
              >
                Cancelar
              </button>

              <button type="submit" className="reporte-btn-enviar">
                Enviar reporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Formulario;
