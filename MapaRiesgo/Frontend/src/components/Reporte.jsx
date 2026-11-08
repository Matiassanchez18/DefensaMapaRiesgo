import { useState } from "react";
import "../Style/reporte.css";

function Reporte() {
  const [datos, setDatos] = useState({
    lugar: "",
    fecha: "",
    descripcion: "",
    tipo: "",
    otroTipo: "",
    testigos: "",
    evidencia: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setDatos({ ...datos, [name]: files ? files[0] : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(datos);
  };

  return (
    <div className="reporte">
      <div className="reporte-card">
        <h1 className="reporte-titulo">Reportar un hecho</h1>
        <br />

        <form onSubmit={handleSubmit} className="reporte-form">
          <fieldset className="reporte-grupo">
            <legend>Lugar y fecha</legend>
            <div className="reporte-fila">
              <input
                type="text"
                name="lugar"
                value={datos.lugar}
                onChange={handleChange}
                placeholder="Lugar del hecho"
                className="reporte-campo"
              />
            <br />
              <input
                type="datetime-local"
                name="fecha"
                value={datos.fecha}
                onChange={handleChange}
                className="reporte-campo"
              />
            </div>
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
            />

            <select
              name="tipo"
              value={datos.tipo}
              onChange={handleChange}
              className="reporte-campo"
            >
              <option value="">Tipo de hecho</option>
              {/* tus opciones: <option value="robo">Robo</option> ... */}
              <option value="otro">Otro</option>
            </select>

            {datos.tipo === "otro" && (
              <input
                type="text"
                name="otroTipo"
                value={datos.otroTipo}
                onChange={handleChange}
                placeholder="Especificá el tipo"
                className="reporte-campo"
              />
            )}

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

          <fieldset className="reporte-grupo">
            <legend>Evidencia (opcional)</legend>
            <input
              type="file"
              name="evidencia"
              accept="image/*,video/*"
              onChange={handleChange}
              className="reporte-archivo"
            />
          </fieldset>

          <button type="submit" className="reporte-boton">
            Enviar reporte
          </button>
        </form>
      </div>
    </div>
  );
}

export default Reporte;