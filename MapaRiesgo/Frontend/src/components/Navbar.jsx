import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import useAuthStore from "./Store";
  
function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const inicioSesion = useAuthStore((state) => state.inicioSesion);
const logout = useAuthStore((state) => state.logout);
const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    setAbierto(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#1B2B3A] p-4 text-white md:flex md:items-center md:justify-around">
      <div className="flex w-full items-center justify-between md:w-auto">
        <Link to="/" className="whitespace-nowrap text-xl font-bold">
          <i className="bi bi-geo-alt-fill"></i> MAPA DE RIESGO
        </Link>

        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="w-auto shrink-0 rounded-md border border-slate-600 px-3 py-1 text-2xl md:hidden"
        >
          <i className={abierto ? "bi bi-x-lg" : "bi bi-list"}></i>
        </button>
      </div>

      <ul
        className={`${abierto ? "flex" : "hidden"} mt-4 flex-col gap-4 md:mt-0 md:flex md:flex-row`}
      >
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/Mapa">Mapa</Link>
        </li>
        <li>
          <Link to="/denuncia">Agregar denuncia</Link>
        </li>
        <li>
  {inicioSesion ? (
    <button type="button" onClick={cerrarSesion} className="cursor-pointer">
      Cerrar sesión
    </button>
  ) : (
    <Link to="/login">Iniciar sesión</Link>
  )}        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
