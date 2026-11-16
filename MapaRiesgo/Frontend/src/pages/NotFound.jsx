import { Link } from "react-router-dom";
import "../style/NoEncontrado.css"

function NotFound(){
   return (
    <div className="error404">
      <div className="error404-contenido">
        <h1>404</h1>

        <h2>¡Ups! Página no encontrada</h2>

        <p>
          La página que estás buscando no existe,
          fue eliminada o la dirección es incorrecta.
        </p>

        <Link to="/" className="error404-boton">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
export default NotFound