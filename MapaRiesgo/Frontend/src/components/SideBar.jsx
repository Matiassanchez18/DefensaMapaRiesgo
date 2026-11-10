import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "../style/DashboardAdmin.css";
function SideBar() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row text-white">
      <aside className="flex w-full shrink-0 flex-col border-r border-line bg-sidebar px-3.5 py-5 md:w-[232px]">
        <div className="flex items-center gap-2.5 px-3 pb-1 text-[15px] font-bold tracking-wide text-white">
          <i className="bi bi-geo-alt"></i>
          MAPA DE RIESGO
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          <p className="mx-3 mb-1.5 mt-5 text-[11px] font-semibold uppercase tracking-widest">
            General
          </p>

          <NavLink to="/admin" end className="nav-link">
            <i className="bi bi-grid"></i>
            Dashboard
          </NavLink>

          <NavLink to="/admin/reportes" className="nav-link">
            <i className="bi bi-file-earmark-text"></i>
            Reportes
          </NavLink>

          <NavLink to="/admin/mapa" className="nav-link">
            <i className="bi bi-map"></i>
            Mapa
          </NavLink>

          

          <p className="mx-3 mb-1.5 mt-5 text-[11px] font-semibold uppercase tracking-widest ">
            Administración
          </p>

          <NavLink to="/admin/usuarios" className="nav-link">
            <i className="bi bi-people"></i>
            Usuarios
          </NavLink>

        
        </nav>

        <div className="mt-6 flex items-center gap-2.5 border-t border-line px-3 pt-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            A
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">
              Administrador
            </span>
            <span className="text-[11px] ">Cerrar sesión</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-fondo p-6 text-white">
        <Outlet />
      </main>
    </div>
  );
}

export default SideBar;
