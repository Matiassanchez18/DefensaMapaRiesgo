
import { useEffect, useRef, useState } from "react";

const API = "http://localhost:3000/api/criminales";

const CarruselCriminales = () => {
  const [criminales, setCriminales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const carruselRef = useRef(null);

  useEffect(() => {
    const obtenerCriminales = async () => {
      try {
        const respuesta = await fetch(API);

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los criminales.");
        }

        const datos = await respuesta.json();

        setCriminales(
          Array.isArray(datos) ? datos : datos.criminales || []
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerCriminales();
  }, []);

  const moverCarrusel = (direccion) => {
    if (carruselRef.current) {
      carruselRef.current.scrollBy({
        left: direccion * 250,
        behavior: "smooth",
      });
    }
  };


useEffect(() => {
  if (criminales.length <= 1) return;

  const intervalo = setInterval(() => {
    const carrusel = carruselRef.current;

    if (!carrusel) return;

    const limite =
      carrusel.scrollWidth - carrusel.clientWidth;

    if (carrusel.scrollLeft >= limite - 5) {
      carrusel.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    } else {
      carrusel.scrollBy({
        left: 240,
        behavior: "smooth",
      });
    }
  }, 3000);

  return () => clearInterval(intervalo);
}, [criminales]);

  return (
    <section className="bg-[#0d1b2a] text-white py-8 px-3 md:px-6">
      <div className="max-w-[1320px] mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <i className="bi bi-shield-exclamation text-base"></i>

              <span className="text-xs font-semibold uppercase tracking-wider">
                Información de seguridad
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white">
              Criminales más buscados
            </h2>

            <p className="text-gray-400 mt-1 text-xs md:text-sm">
              Personas con orden de búsqueda vigente.
              Por favor si sabe de su paradero reportar al 911
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => moverCarrusel(-1)}
              className="w-8 h-8 rounded-md bg-[#1b263b] border border-gray-700 text-gray-300 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
              aria-label="Anterior"
            >
              <i className="bi bi-chevron-left text-xs"></i>
            </button>

            <button
              onClick={() => moverCarrusel(1)}
              className="w-8 h-8 rounded-md bg-[#1b263b] border border-gray-700 text-gray-300 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
              aria-label="Siguiente"
            >
              <i className="bi bi-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        {cargando && (
          <p className="text-center text-gray-400 py-8 text-sm">
            Cargando información...
          </p>
        )}

        {error && (
          <p className="text-center text-red-400 py-8 text-sm">
            <i className="bi bi-exclamation-circle mr-2"></i>
            {error}
          </p>
        )}

        {!cargando && !error && criminales.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">
            No hay criminales registrados.
          </p>
        )}

        {!cargando && !error && criminales.length > 0 && (
          <div
            ref={carruselRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {criminales.map((criminal) => (
              <article
                key={criminal.id_criminal}
                className="min-w-[220px] max-w-[220px] bg-[#1b263b] border border-gray-700 rounded-lg overflow-hidden snap-start shadow-sm hover:border-red-500 transition duration-300"
              >
                <div className="h-36 bg-[#0d1b2a] overflow-hidden">
                  <img
                    src={criminal.foto}
                    alt={`${criminal.nombre} ${criminal.apellido}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="p-3">
                  <span className="inline-block bg-red-500/15 text-red-400 text-[10px] font-semibold px-2 py-1 rounded mb-2">
                    <i className="bi bi-exclamation-circle mr-1"></i>
                    {criminal.estado || "Buscado"}
                  </span>

                  <h3 className="text-sm font-bold text-white">
                    {criminal.nombre} {criminal.apellido}
                  </h3>

                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {criminal.descripcion || "Sin descripción disponible."}
                  </p>

                  {criminal.orden_busqueda && (
                    <div className="border-t border-gray-700 mt-3 pt-2">
                      <p className="text-red-400 text-xs font-medium">
                        <i className="bi bi-search mr-1"></i>
                        {criminal.orden_busqueda}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CarruselCriminales;
