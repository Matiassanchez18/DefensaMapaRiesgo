
import { useState } from "react";
import "../Style/reporte.css";

function Reporte() {
  const [datos, setDatos] = useState({
    direccion: "",
    descripcion: "",
    id_delito: "",
    testigos: "",
    latitud: "",
    longitud: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDatos({
      ...datos,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!datos.latitud || !datos.longitud) {
      setMensaje("Primero tenés que seleccionar la ubicación del hecho.");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await fetch(
        "http://localhost:3000/api/reportes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...datos,
            id_delito: Number(datos.id_delito),
            latitud: Number(datos.latitud),
            longitud: Number(datos.longitud),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || "Error al enviar la denuncia.");
      }

      setMensaje("Denuncia registrada correctamente.");

      setDatos({
        direccion: "",
        descripcion: "",
        id_delito: "",
        testigos: "",
        latitud: "",
        longitud: "",
      });

    } catch (error) {
      console.error("Error al enviar denuncia:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="reporte">
      <div className="reporte-card">
        <h1 className="reporte-titulo">Reportar un hecho</h1>

        <form onSubmit={handleSubmit} className="reporte-form">

          <fieldset className="reporte-grupo">
            <legend>Lugar del hecho</legend>

            <input
              type="text"
              name="direccion"
              value={datos.direccion}
              onChange={handleChange}
              placeholder="Dirección del hecho"
              className="reporte-campo"
              required
            />
          </fieldset>

          <fieldset className="reporte-grupo">
            <legend>Descripción del hecho</legend>

            <textarea
              name="descripcion"
              value={datos.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Contá qué pasó"
              className="reporte-campo"
              required
            />

            <select
              name="id_delito"
              value={datos.id_delito}
              onChange={handleChange}
              className="reporte-campo"
              required
            >
              <option value="">Seleccioná el tipo de hecho</option>

              {/* Acá deben ir los delitos que existen en MySQL */}
              <option value="1">Robo</option>
              <option value="2">Hurto</option>
              <option value="3">Vandalismo</option>
              <option value="4">Otro</option>
            </select>

            <div>
              <p className="reporte-pregunta">¿Hubo testigos?</p>

              <div className="reporte-radios">
                <label>
                  <input
                    type="radio"
                    name="testigos"
                    value="si"
                    checked={datos.testigos === "si"}
                    onChange={handleChange}
                    required
                  />
                  Sí
                </label>

                <label>
                  <input
                    type="radio"
                    name="testigos"
                    value="no"
                    checked={datos.testigos === "no"}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>
          </fieldset>

          {/* Coordenadas temporales para probar el backend */}
          <fieldset className="reporte-grupo">
            <legend>Ubicación geográfica</legend>

            <input
              type="number"
              step="any"
              name="latitud"
              value={datos.latitud}
              onChange={handleChange}
              placeholder="Latitud"
              className="reporte-campo"
              required
            />

            <input
              type="number"
              step="any"
              name="longitud"
              value={datos.longitud}
              onChange={handleChange}
              placeholder="Longitud"
              className="reporte-campo"
              required
            />
          </fieldset>

          {mensaje && (
            <p role="status">{mensaje}</p>
          )}

          <button
            type="submit"
            className="reporte-boton"
            disabled={cargando}
          >
            {cargando ? "Enviando..." : "Enviar denuncia"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Reporte;
