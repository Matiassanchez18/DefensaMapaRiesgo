
import "../style/Formulario.css";
import useAuthStore from "../store/Store";

function Formulario({
  darValor,
  ubicacion,
  seleccionarEnMapa,
}) {
  const ocultarModal = () => {
    darValor(false);
  };

  const usuario = useAuthStore((state) => state.usuario);
  console.log("USUARIO EN ZUSTAND:", usuario);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario || !usuario.id_usuario) {
      console.log("ID DEL USUARIO:", usuario?.id_usuario);
      alert("Debés iniciar sesión para cargar un reporte.");
      return;
    }

    if (!ubicacion) {
      alert("No se pudo obtener ninguna ubicación.");
      return;
    }

    const datosFormulario = new FormData(e.target);

    const reporte = {
      id_usuario: usuario.id_usuario,
      id_delito: Number(datosFormulario.get("id_delito")),
      direccion: datosFormulario.get("direccion").trim(),
      descripcion: datosFormulario.get("descripcion").trim(),
      testigos: datosFormulario.get("testigos") === "si",
      latitud: Number(ubicacion[0]),
      longitud: Number(ubicacion[1]),
    };

    console.log("Datos enviados:", reporte);

    try {
      const respuesta = await fetch("http://localhost:3000/api/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reporte),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        if (datos.errores && datos.errores.length > 0) {
          const mensajes = datos.errores
            .map((error) => `${error.campo}: ${error.mensaje}`)
            .join("\n");

          throw new Error(mensajes);
        }

        throw new Error(datos.mensaje || "Error al guardar el reporte");
      }

      alert("¡Reporte guardado correctamente!");

      e.target.reset();
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
                  <input type="radio" name="testigos" value="si" required />
                  Sí
                </label>

                <label className="reporte-opcion">
                  <input type="radio" name="testigos" value="no" />
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
