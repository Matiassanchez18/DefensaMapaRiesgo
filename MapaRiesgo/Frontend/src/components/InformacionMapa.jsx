import "../Style/Home.css";

function InformacionMapa({ titulo, descripcion }) {
  return (
    <div>
      <article className="informacion-mapa">
        <header className="informacion-mapa-encabezado">{titulo}</header>

        <div className="informacion-mapa-contenido">
          <p className="informacion-mapa-texto">{descripcion}</p>

          <a href="#" className="informacion-mapa-boton">
            Conocé más +
          </a>
        </div>
      </article>
    </div>
  );
}

export default InformacionMapa;
