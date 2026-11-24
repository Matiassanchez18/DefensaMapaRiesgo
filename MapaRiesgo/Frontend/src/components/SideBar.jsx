import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../style/DashboardAdmin.css";
import useAuthStore from "../store/Store";

function SideBar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    logout();
    navigate("/");
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden text-white md:flex-row">
      {/* HEADER MOBILE */}
      <header className="flex shrink-0 items-center justify-between border-b border-line bg-sidebar px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 font-bold text-white">
          <i className="bi bi-geo-alt"></i>
          MAPA DE RIESGO
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-xl hover:bg-white/10"
          aria-label="Abrir o cerrar menú"
        >
          <i className={`bi ${menuAbierto ? "bi-x-lg" : "bi-list"}`}></i>
        </button>
      </header>

      {/* FONDO OSCURO MOBILE */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={cerrarMenu}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-[250px] shrink-0 flex-col
          border-r border-line bg-sidebar px-3.5 py-5
          overflow-hidden
          transition-transform duration-300 ease-in-out
          md:sticky md:top-0 md:z-auto md:flex md:h-screen md:w-[232px] md:translate-x-0
          ${menuAbierto ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* TÍTULO */}
        <div className="mb-2 flex shrink-0 items-center gap-2.5 px-3 pb-1 text-[15px] font-bold tracking-wide text-white">
          <i className="bi bi-geo-alt"></i>
          MAPA DE RIESGO
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
          <p className="mx-3 mb-1.5 mt-5 text-[11px] font-semibold uppercase tracking-widest">
            General
          </p>

          <NavLink to="/" className={linkClass} onClick={cerrarMenu}>
            <i className="bi bi-house"></i>
            Inicio
          </NavLink>

          <NavLink to="/admin" end className={linkClass} onClick={cerrarMenu}>
            <i className="bi bi-grid"></i>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/reportes"
            className={linkClass}
            onClick={cerrarMenu}
          >
            <i className="bi bi-file-earmark-text"></i>
            Reportes
          </NavLink>

          <NavLink to="/admin/mapa" className={linkClass} onClick={cerrarMenu}>
            <i className="bi bi-map"></i>
            Mapa
          </NavLink>

          <p className="mx-3 mb-1.5 mt-5 text-[11px] font-semibold uppercase tracking-widest">
            Administración
          </p>

          <NavLink
            to="/admin/usuarios"
            className={linkClass}
            onClick={cerrarMenu}
          >
            <i className="bi bi-people"></i>
            Usuarios
          </NavLink>

          <NavLink
            to="/admin/crudTestigos"
            className={linkClass}
            onClick={cerrarMenu}
          >
            <i className="bi bi-person-lines-fill"></i>
            Testigos
          </NavLink>

          <NavLink
            to="/admin/criminales"
            className={linkClass}
            onClick={cerrarMenu}
          >
            <i className="bi bi-incognito"></i>
            Criminales
          </NavLink>
        </nav>

        {/* USUARIO Y CIERRE DE SESIÓN */}
        <div className="mt-4 flex shrink-0 items-center gap-2.5 border-t border-line px-3 pt-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            A
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">
              Administrador
            </span>

            <button
              type="button"
              onClick={cerrarSesion}
              className="text-left text-[11px] hover:text-red-400"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-fondo p-4 text-white sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default SideBar;
