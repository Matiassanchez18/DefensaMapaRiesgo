
import { useState } from "react";
import useAuthStore from "../store/Store";
import "../style/Formulario.css";

function Reporte() {
  const [ubicacion, setUbicacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const usuario = useAuthStore((state) => state.usuario);

  // Obtener ubicación GPS
  const seleccionarEnMapa = () => {
    if (!navigator.geolocation) {
      setMensaje("Tu navegador no permite obtener la ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setUbicacion([
          posicion.coords.latitude,
          posicion.coords.longitude,
        ]);

        setMensaje("Ubicación obtenida correctamente.");
      },
      () => {
        setMensaje("No se pudo obtener tu ubicación.");
      }
    );
  };

  // Enviar reporte
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!usuario) {
      setMensaje("Tenés que iniciar sesión para realizar un reporte.");
      return;
    }

    const idUsuario = Number(usuario.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      console.error("Datos del usuario:", usuario);
      setMensaje("No se pudo identificar al usuario. Volvé a iniciar sesión.");
      return;
    }

    if (!ubicacion) {
      setMensaje("Primero tenés que obtener la ubicación del hecho.");
      return;
    }

    const datosFormulario = new FormData(e.target);

    const reporte = {
      id_usuario: idUsuario,
      id_delito: Number(datosFormulario.get("id_delito")),
      direccion: datosFormulario.get("direccion").trim(),
      descripcion: datosFormulario.get("descripcion").trim(),
      testigos: datosFormulario.get("testigos") === "si",
      latitud: Number(ubicacion[0]),
      longitud: Number(ubicacion[1]),
    };

    try {
      setCargando(true);

      const respuesta = await fetch(
        "http://localhost:3000/api/reportes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reporte),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        if (resultado.errores?.length > 0) {
          throw new Error(
            resultado.errores
              .map((error) => `${error.campo}: ${error.mensaje}`)
              .join("\n")
          );
        }

        throw new Error(
          resultado.mensaje || "Error al enviar el reporte."
        );
      }

      setMensaje("Reporte registrado correctamente.");
      e.target.reset();
      setUbicacion(null);

    } catch (error) {
      console.error("Error al enviar reporte:", error);
      setMensaje(error.message);

    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="reporte">
      <div className="reporte-card">

        <div className="reporte-header">
          <h2>Realizar reporte</h2>
          <p>Completá los datos del hecho ocurrido</p>
        </div>

        <form
          className="reporte-form"
          onSubmit={handleSubmit}
        >

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
            <label htmlFor="direccion">
              Dirección o referencia
            </label>

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
                />
                Sí
              </label>

              <label className="reporte-opcion">
                <input
                  type="radio"
                  name="testigos"
                  value="no"
                />
                No
              </label>
            </div>
          </div>

          <div className="reporte-campo">
            <label htmlFor="descripcion">
              Descripción del hecho
            </label>

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
                ? "Ubicación seleccionada correctamente."
                : "Todavía no se seleccionó una ubicación."}
            </p>

            <button
              type="button"
              className="reporte-input-icono"
              onClick={seleccionarEnMapa}
            >
              <i className="bi bi-geo-alt"></i>
              Obtener ubicación actual
            </button>
          </div>

          {mensaje && (
            <p role="status">{mensaje}</p>
          )}

          <div className="reporte-acciones">
            <button
              type="submit"
              className="reporte-btn-enviar"
              disabled={cargando}
            >
              {cargando ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Reporte;
