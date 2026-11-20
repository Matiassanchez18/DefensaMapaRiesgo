import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import useAuthStore from "../store/Store";

function Footer() {
  const usuario = useAuthStore((state) => state.usuario);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [variacionRobos, setVariacionRobos] = useState(null);
  const [totalReportes, setTotalReportes] = useState(0);
  const [totalZonas, setTotalZonas] = useState(0);

  useEffect(() => {
    const obtenerTotales = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/reportes/dashboard",
        );

        if (!respuesta.ok) {
          throw new Error("Error al obtener los totales");
        }

        const datos = await respuesta.json();

        setTotalReportes(datos.estadisticas.reportesTotales);
        setTotalZonas(datos.estadisticas.zonasMonitoreadas);
      } catch (error) {
        console.error("Error al obtener reportes y zonas:", error);
      }
    };

    obtenerTotales();
  }, []);

  const API_URL = "http://localhost:3000/api/contactos-emergencia";

  useEffect(() => {
    const obtenerVariacionRobos = async () => {
      try {
        const respuesta = await fetch("http://localhost:3000/api/estadisticas");

        if (!respuesta.ok) {
          throw new Error("Error al obtener estadísticas");
        }

        const datos = await respuesta.json();

        setVariacionRobos(datos.variacionRobos);
      } catch (error) {
        console.error("Error al obtener variación de robos:", error);
      }
    };

    obtenerVariacionRobos();
  }, []);

  const obtenerContactos = async () => {
    if (!usuario?.id_usuario) {
      setMensaje("Iniciá sesión para consultar tus contactos de emergencia.");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`${API_URL}/${usuario.id_usuario}`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al obtener contactos.");
      }

      setContactos(datos);

      if (datos.length === 0) {
        setMensaje("No tenés contactos de emergencia registrados.");
      }
    } catch (error) {
      console.error("Error al obtener contactos:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalEmergencia = () => {
    setMostrarModal(true);
    setContactos([]);
    obtenerContactos();
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setMensaje("");
  };

  const estiloNav = ({ isActive }) =>
    `flex min-h-[55px] flex-col items-center justify-center gap-0.5 no-underline transition md:min-h-[65px] lg:min-h-[45px] ${
      isActive ? "text-white" : "text-gray-400 hover:text-white"
    }`;

  const porcentaje = variacionRobos?.porcentaje;

  const textoVariacion =
    porcentaje === null || porcentaje === undefined
      ? "N/D"
      : `${porcentaje > 0 ? "+" : ""}${porcentaje}%`;

  const iconoVariacion =
    porcentaje === null || porcentaje === undefined
      ? "bi-dash"
      : porcentaje > 0
        ? "bi-arrow-up"
        : porcentaje < 0
          ? "bi-arrow-down"
          : "bi-dash";

  const colorVariacion =
    porcentaje === null || porcentaje === undefined
      ? "text-gray-300"
      : porcentaje > 0
        ? "text-red-400"
        : porcentaje < 0
          ? "text-green-400"
          : "text-gray-300";

  return (
    <div>
      <footer className="fixed bottom-0 left-0 z-50 w-full bg-[#1b2b3a] text-[#f1f3f5]">
        <div className="border-b border-gray-600">
          <div className="grid grid-cols-3 text-center">
            <div className="border-r border-gray-600 py-2">
              <h4 className="mb-0 text-[22px] font-bold md:text-2xl lg:text-base">
                {totalReportes}
              </h4>
              <small className="block text-xs leading-tight md:text-[13px] lg:text-[10px]">
                REPORTES
              </small>
            </div>

            <div className="border-r border-gray-600 py-2">
              <h4 className="mb-0 text-[22px] font-bold md:text-2xl lg:text-base">
                {totalZonas}
              </h4>
              <small className="block text-xs leading-tight md:text-[13px] lg:text-[10px]">
                ZONAS
              </small>
            </div>

            <div className="py-2">
              <h4
                className={`mb-0 text-[22px] font-bold md:text-2xl lg:text-base ${colorVariacion}`}
              >
                <i className={`bi ${iconoVariacion}`}></i> {textoVariacion}
              </h4>

              <small className="block text-xs leading-tight md:text-[13px] lg:text-[10px]">
                ESTE MES
              </small>
            </div>
          </div>
        </div>

        <nav className="grid grid-cols-4 text-center lg:py-0">
          <NavLink to="/" end className={estiloNav}>
            <i className="bi bi-house-fill text-2xl lg:text-lg"></i>
            <small className="text-xs leading-tight md:text-[13px] lg:text-[10px]">
              Inicio
            </small>
          </NavLink>

          <NavLink to="/mapa" className={estiloNav}>
            <i className="bi bi-geo-alt-fill text-2xl lg:text-lg"></i>
            <small className="text-xs leading-tight md:text-[13px] lg:text-[10px]">
              Mapa
            </small>
          </NavLink>

          <NavLink to="/denuncia" className={estiloNav}>
            <i className="bi bi-plus-lg text-2xl lg:text-lg"></i>
            <small className="text-xs leading-tight md:text-[13px] lg:text-[10px]">
              Denuncia
            </small>
          </NavLink>

          <button
            type="button"
            onClick={abrirModalEmergencia}
            className="flex min-h-[55px] flex-col items-center justify-center gap-0.5 text-red-400 transition hover:text-red-300 md:min-h-[65px] lg:min-h-[45px]"
          >
            <i className="bi bi-telephone-fill text-2xl lg:text-lg"></i>
            <small className="text-xs leading-tight md:text-[13px] lg:text-[10px]">
              Emergencia
            </small>
          </button>
        </nav>
      </footer>

      {mostrarModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={cerrarModal}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-[#52677a] bg-[#1b2b3a] p-5 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Contactos de emergencia
                </h2>
                <p className="text-sm text-gray-300">
                  Seleccioná a quién querés llamar.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="text-2xl text-white hover:text-gray-300"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>

            {cargando ? (
              <p className="py-5 text-center text-gray-300">
                Cargando contactos...
              </p>
            ) : mensaje ? (
              <p className="rounded-lg border border-[#52677a] bg-[#263b4d] p-4 text-center text-gray-200">
                {mensaje}
              </p>
            ) : (
              <div className="space-y-3">
                {contactos.map((contacto) => (
                  <div
                    key={contacto.id_contacto}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#52677a] bg-[#263b4d] p-4"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold text-white">
                        {contacto.nombre}
                      </h3>

                      <p className="text-sm text-gray-300">
                        {contacto.relacion}
                      </p>

                      <p className="text-sm text-gray-300">
                        {contacto.telefono}
                      </p>
                    </div>

                    <a
                      href={`tel:${String(contacto.telefono).replace(/[^\d+]/g, "")}`}
                      className="flex shrink-0 items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-green-700"
                    >
                      <i className="bi bi-telephone-fill"></i>
                      Llamar
                    </a>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={cerrarModal}
              className="mt-5 w-full rounded-lg bg-[#34495e] py-2 font-medium text-white hover:bg-[#405b73]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Footer;
