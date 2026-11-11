
import { Link } from "react-router-dom";
import "../Style/Home.css";
import LlamadoEmergencia from "./LlamadoEmergencia";

function AccionesRapidas() {
  return (
    <section className="acciones-rapidas">
      <Link to="/denuncia" className="accion-rapida">
        <i className="bi bi-exclamation-triangle accion-rapida-icono accion-rapida-icono--alerta"></i>
        <span className="accion-rapida-texto">Reportar hecho</span>
      </Link>

      <Link to="/Mapa" className="accion-rapida">
        <i className="bi bi-map accion-rapida-icono accion-rapida-icono--mapa"></i>
        <span className="accion-rapida-texto">Ver Mapa</span>
      </Link>

      <LlamadoEmergencia />
    </section>
  );
}

export default AccionesRapidas;

