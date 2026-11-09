import { NavLink } from "react-router-dom";
function SideBar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-line bg-sidebar px-3.5 py-5 md:w-[232px]">
      <div className="flex items-center gap-2.5 px-3 pb-1 text-[15px] font-bold tracking-wide text-white">
        <MapPin size={20} />
        MAPA DE RIESGO
      </div>
      <nav className="flex flex-col gap-0.5">
        <p>General</p>
        <NavLink to="/" className="">
          Inicio
        </NavLink>
        <NavLink to="/" className="">
          Inicio
        </NavLink>
        <NavLink to="/" className="">
          Inicio
        </NavLink>
        <NavLink to="/" className="">
          Inicio
        </NavLink>
      </nav>
    </aside>
  );
}

export default SideBar;
