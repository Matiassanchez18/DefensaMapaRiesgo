import {Link} from "react-router-dom"
 
function Footer() {
  return (
    <div>
      <footer className="fixed bottom-0 left-0 z-50 w-full bg-[#1b2b3a] text-[#f1f3f5]">
        <div className="border-b border-gray-600">
          <div className="grid grid-cols-3 text-center">
            <div className="border-r border-gray-600 py-2">
              <h4 className="mb-0 text-[22px] font-bold md:text-2xl lg:text-base">
                268
              </h4>
              <small className="block text-xs leading-tight md:text-[13px] lg:text-[10px]">
                REPORTES
              </small>
            </div>

            <div className="border-r border-gray-600 py-2">
              <h4 className="mb-0 text-[22px] font-bold md:text-2xl lg:text-base">
                18
              </h4>
              <small className="block text-xs leading-tight md:text-[13px] lg:text-[10px]">
                ZONAS
              </small>
            </div>

            <div className="py-2">
              <h4 className="mb-0 text-[22px] font-bold md:text-2xl lg:text-base">
                <i className="bi bi-arrow-up"></i> 12%
              </h4>
              <small className="block text-xs leading-tight md:text-[13px] lg:text-[10px]">
                ESTE MES
              </small>
            </div>
          </div>
        </div>

        <nav className="grid grid-cols-3 text-center lg:py-0">
          <Link
            to="/"
            className="flex min-h-[55px] flex-col items-center justify-center gap-0.5 text-gray-400 no-underline transition hover:text-white md:min-h-[65px] lg:min-h-[45px]"
          >
            <i className="bi bi-house-fill text-2xl lg:text-lg"></i>
            <small className="text-xs leading-tight md:text-[13px] lg:text-[10px]">
              Inicio
            </small>
          </Link>

          <Link
            to="/mapa"
            className="flex min-h-[55px] flex-col items-center justify-center gap-0.5 text-[#14daaf] no-underline transition hover:text-white md:min-h-[65px] lg:min-h-[45px]"
          >
            <i className="bi bi-geo-alt-fill text-2xl lg:text-lg"></i>
            <small className="text-xs leading-tight md:text-[13px] lg:text-[10px]">
              Mapa
            </small>
          </Link>

          <Link
            to="/denuncia"
            className="flex min-h-[55px] flex-col items-center justify-center gap-0.5 text-gray-400 no-underline transition hover:text-white md:min-h-[65px] lg:min-h-[45px]"
          >
            <i className="bi bi-plus-lg text-2xl lg:text-lg"></i>
            <small className="text-xs leading-tight md:text-[13px] lg:text-[10px]">
              Denuncia
            </small>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
export default Footer;
