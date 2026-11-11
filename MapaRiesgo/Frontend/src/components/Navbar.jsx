
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/Store";

function Navbar() {
  const [abierto, setAbierto] = useState(false);

  const inicioSesion = useAuthStore((state) => state.inicioSesion);
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const location = useLocation();

  const cerrarSesion = () => {
    logout();
    setAbierto(false);
    navigate("/");
  };

  const cerrarMenu = () => setAbierto(false);

  const estiloLink = (ruta) =>
    `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
      location.pathname === ruta
        ? "bg-white/15 text-white shadow-inner"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-[1000] border-b border-white/10 bg-[#142536]/95 text-white shadow-lg shadow-black/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        
        <Link
          to="/"
          onClick={cerrarMenu}
          className="group flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-xl text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
            <i className="bi bi-geo-alt-fill"></i>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wide text-white">
              MAPA DE RIESGO
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[2px] text-slate-400">
              Seguridad ciudadana
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xl transition hover:bg-white/10 md:hidden"
        >
          <i className={abierto ? "bi bi-x-lg" : "bi bi-list"}></i>
        </button>
        <div
          className={`absolute left-0 top-full w-full border-b border-white/10 bg-[#142536] px-5 py-5 shadow-xl transition-all duration-300 md:static md:block md:w-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
            abierto ? "visible opacity-100" : "invisible opacity-0 md:visible md:opacity-100"
          }`}
        >
          <ul className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1">
            <li>
              <Link
                to="/"
                onClick={cerrarMenu}
                className={estiloLink("/")}
              >
                <i className="bi bi-house-door text-base"></i>
                Inicio
              </Link>
            </li>

            <li>
              <Link
                to="/mapa"
                onClick={cerrarMenu}
                className={estiloLink("/mapa")}
              >
                <i className="bi bi-map text-base"></i>
                Mapa
              </Link>
            </li>

            <li>
              <Link
                to="/denuncia"
                onClick={cerrarMenu}
                className={estiloLink("/denuncia")}
              >
                <i className="bi bi-clipboard-plus text-base"></i>
                Agregar denuncia
              </Link>
            </li>

            {inicioSesion && usuario?.rol === "admin" && (
              <li>
                <Link
                  to="/admin"
                  onClick={cerrarMenu}
                  className="flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/15 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:border-blue-400/40 hover:bg-blue-500/25 hover:text-white"
                >
                  <i className="bi bi-speedometer2 text-base"></i>
                  Dashboard
                </Link>
              </li>
            )}

            <li className="my-2 border-t border-white/10 md:mx-2 md:my-0 md:h-7 md:border-l md:border-t-0"></li>

            <li>
              {inicioSesion ? (
                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-red-200 md:w-auto"
                >
                  <i className="bi bi-box-arrow-right text-base"></i>
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={cerrarMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/30 transition hover:bg-blue-500"
                >
                  <i className="bi bi-person-circle text-base"></i>
                  Iniciar sesión
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
