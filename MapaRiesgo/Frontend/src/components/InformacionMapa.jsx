
import { Link } from "react-router-dom";
import "../style/Home.css";

function InformacionMapa({ titulo, descripcion }) {
  return (
    <article className="informacion-mapa">
      <header className="informacion-mapa-encabezado">
        {titulo}
      </header>

      <div className="informacion-mapa-contenido">
        <p className="informacion-mapa-texto">
          {descripcion}
        </p>

        <Link to="*" className="informacion-mapa-boton">
          Conocé más +
        </Link>
      </div>
    </article>
  );
}

export default InformacionMapa;
