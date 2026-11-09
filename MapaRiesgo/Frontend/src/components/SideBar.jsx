import { NavLink } from "react-router-dom";
function SideBar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-line bg-sidebar px-3.5 py-5 md:w-[232px]">
      <div className="flex items-center gap-2.5 px-3 pb-1 text-[15px] font-bold tracking-wide text-white">
        <MapPin size={20} />
        MAPA DE RIESGO
      </div>
      <nav className="flex flex-col gap-0.5">
        <p className="mx-3 mb-1.5 mt-5 text-[11px] font-semibold uppercase tracking-widest text-muted">General</p>

       <NavLink to="/" end className="nav-link">
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

           <NavLink to="/mapa" className="nav-link">
          <i className="bi bi-map"></i>
          Mapa
        </NavLink>

         
        <NavLink to="/reportes" className="nav-link">
          <i className="bi bi-file-earmark-text"></i>
          Reportes
        </NavLink>
        
      </nav>
    </aside>
  );
}

export default SideBar;
