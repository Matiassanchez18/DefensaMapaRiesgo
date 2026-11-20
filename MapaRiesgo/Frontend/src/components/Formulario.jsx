import { useState } from "react";
import "../style/Formulario.css";
import useAuthStore from "../store/Store";

function Formulario({ darValor, ubicacion, seleccionarEnMapa }) {
  const [testigo, setTestigo] = useState(false);

  const usuario = useAuthStore((state) => state.usuario);

  const ocultarModal = () => {
    darValor(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario?.id_usuario) {
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

    if (hayTestigos && (!nombreTestigo || !apellidoTestigo)) {
      alert("Completá el nombre y apellido del testigo.");
      return;
    }

    const reporte = {
      id_usuario: usuario.id_usuario,
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
        },
        body: JSON.stringify(reporte),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "Error al guardar el reporte.");
      }

      alert("¡Reporte guardado correctamente!");

      formulario.reset();
      setTestigo(false);
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
                    onChange={() => setTestigo(false)}
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
                        required
                      />
                    </div>

                    <div className="reporte-campo">
                      <label htmlFor="apellido_testigo">Apellido</label>
                      <input
                        type="text"
                        id="apellido_testigo"
                        name="apellido_testigo"
                        className="reporte-input-icono"
                        placeholder="Ej: Pérez"
                        required
                      />
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
                        />
                      </div>
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
