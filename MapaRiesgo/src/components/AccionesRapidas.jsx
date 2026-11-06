import "../Style/Home.css";

function AccionesRapidas() {
  return (
    <section className="acciones-rapidas">
      <a href="#" className="accion-rapida">
        <i className="bi bi-exclamation-triangle accion-rapida-icono accion-rapida-icono--alerta"></i>
        <span className="accion-rapida-texto">Reportar hecho</span>
      </a>

      <a href="/Mapa" className="accion-rapida">
        <i className="bi bi-map accion-rapida-icono accion-rapida-icono--mapa"></i>
        <span className="accion-rapida-texto">Ver Mapa</span>
      </a>
    </section>
  );
}

export default AccionesRapidas;