import "../style/Formulario.css";

function Formulario({ darValor }) {
  const ocultarModal = () => {
    darValor(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const datosFormulario = new FormData(e.target);

    const reporte = {
      id_delito: datosFormulario.get("id_delito"),
      direccion: datosFormulario.get("direccion"),
      descripcion: datosFormulario.get("descripcion"),
      testigos: datosFormulario.get("testigos") === "si",
    };

    console.log("Datos del reporte:", reporte);

    // Acá después conectamos el formulario con el backend.
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

            <div className="reporte-acciones">
              <button
                type="button"
                className="reporte-btn-cancelar"
                onClick={ocultarModal}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="reporte-btn-enviar"
              >
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