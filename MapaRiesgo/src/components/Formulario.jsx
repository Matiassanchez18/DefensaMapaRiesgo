
function Formulario({ darValor }) {
  const ocultarModal = () => {
    darValor(false);
  };

  return (
    <div className="modal">
      <div className="form-reporte">
        <div className="reporte-card">
          <button
            type="button"
            className="reporte-cerrar"
            onClick={ocultarModal}
            aria-label="Cerrar formulario"
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <div className="reporte-header">
            <div className="reporte-icono">
              <i className="bi bi-exclamation-triangle"></i>
            </div>

            <div>
              <h2>Nuevo reporte</h2>
            </div>
          </div>

          <form
            className="reporte-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="reporte-campo">
              <label htmlFor="hecho">Localidad del hecho</label>

              <div className="reporte-input-icono">
                <i className="bi bi-geo-alt"></i>
                <input
                  type="text"
                  id="hecho"
                  placeholder="Ej. San Lorenzo 2100"
                  required
                />
              </div>
            </div>

            <div className="reporte-campo">
              <label htmlFor="tipo">Tipo de robo</label>

              <div className="reporte-input-icono">
                <i className="bi bi-shield-exclamation"></i>

                <select
                  id="tipo"
                  className="select w-full bg-[#111e2b] text-gray-100 border-none outline-none focus:ring-0"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Seleccioná el tipo de incidente
                  </option>
                  <option value="Arrebato">Arrebato</option>
                  <option value="Robo de celular">Robo de celular</option>
                  <option value="Robo de vehículo">Robo de vehículo</option>
                  <option value="Robo en vivienda">Robo en vivienda</option>
                  <option value="Intento de robo">Intento de robo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
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
                  <span>
                    <i className="bi bi-check-circle"></i>
                    Sí
                  </span>
                </label>

                <label className="reporte-opcion">
                  <input
                    type="radio"
                    name="testigos"
                    value="no"
                  />
                  <span>
                    <i className="bi bi-x-circle"></i>
                    No
                  </span>
                </label>
              </div>
            </div>

            <div className="reporte-campo">
              <label htmlFor="descripcion">
                Descripción del hecho
              </label>

              <textarea
                id="descripcion"
                rows={4}
                placeholder="Contá brevemente qué pasó, dónde y cuándo..."
              />

              <small>
                Cuanto más clara sea la descripción, más útil será para
                otros usuarios.
              </small>
            </div>

            <div className="reporte-acciones">
              <button
                type="reset"
                className="reporte-btn-cancelar"
              >
                Limpiar
              </button>

              <button
                type="submit"
                className="reporte-btn-enviar"
              >
                <i className="bi bi-send"></i>
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
