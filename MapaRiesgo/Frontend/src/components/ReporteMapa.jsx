import { useEffect, useState } from "react";
import "../Style/Mapa.css";

function ReporteMapa({ ubicacion }) {
  const TAM_CELDA = 0.005;
  const API_URL = "http://localhost:3000/api/reportes";

  function obtenerCelda(latitud, longitud) {
    const fila = Math.floor(Number(latitud) / TAM_CELDA);
    const columna = Math.floor(Number(longitud) / TAM_CELDA);

    return `${fila}_${columna}`;
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha no disponible";

    const valor = new Date(fecha);

    if (isNaN(valor.getTime())) return String(fecha).slice(0, 10);

    return valor.toLocaleDateString("es-AR");
  }

  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
          throw new Error("Error al obtener reportes");
        }

        const datos = await respuesta.json();
        setReportes(datos);
      } catch (error) {
        console.error("Error al cargar reportes:", error);
      }
    };

    cargarReportes();

    const intervalo = setInterval(cargarReportes, 5000);

    return () => clearInterval(intervalo);
  }, []);

  if (!ubicacion) {
    return (
      <div className="card-reporte">
        <div className="mb-4 w-full max-w-xl mx-auto p-2 mt-2">
          <div className="rounded-xl border border-gray-700 bg-[#1b263b] p-4 shadow-md">
            <h2 className="text-lg font-semibold text-blue-400">
              <i className="bi bi-geo-alt mr-2"></i>
              Activá tu ubicación
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Necesitamos tu ubicación para mostrar información de tu zona.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const celdaUsuario = obtenerCelda(ubicacion[0], ubicacion[1]);

  const reportesZona = reportes.filter((reporte) => {
    return obtenerCelda(reporte.latitud, reporte.longitud) === celdaUsuario;
  });

  const esZonaPeligrosa = reportesZona.length >= 4;

  const reportesOrdenados = [...reportesZona].sort((a, b) => {
    const fechaA = new Date(
      `${String(a.fecha).slice(0, 10)}T${a.hora || "00:00:00"}`,
    ).getTime();

    const fechaB = new Date(
      `${String(b.fecha).slice(0, 10)}T${b.hora || "00:00:00"}`,
    ).getTime();

    return fechaB - fechaA;
  });

  const ultimoReporte = reportesOrdenados[0];

  return (
    <div className="card-reporte">
      <div className="mb-4 w-full max-w-xl mx-auto p-2 mt-2">
        <div className="rounded-xl border border-gray-700 bg-[#1b263b] p-4 shadow-md">
          <h2
            className={`mb-3 flex items-center gap-2 text-lg font-semibold ${
              esZonaPeligrosa ? "text-red-500" : "text-blue-400"
            }`}
          >
            {esZonaPeligrosa
              ? "Estás en una zona peligrosa"
              : "Último hecho delictivo en tu zona"}

            <i
              className={`bi ${
                esZonaPeligrosa
                  ? "bi-exclamation-circle"
                  : "bi-shield-exclamation"
              }`}
            ></i>
          </h2>

          {ultimoReporte ? (
            <>
              <p className="mb-3 flex items-center gap-2 text-sm text-gray-300">
                <b>Ultimo hecho:</b>
                <i className="bi bi-exclamation-triangle text-yellow-400"></i>
                {ultimoReporte.delito || "Delito"}
                <i className="bi bi-circle-fill text-red-500"></i>
              </p>

              <p className="mb-2 text-sm text-gray-300">
                <strong>Fecha:</strong> {formatearFecha(ultimoReporte.fecha)}
              </p>

              {ultimoReporte.hora && (
                <p className="mb-2 text-sm text-gray-300">
                  <strong>Hora:</strong>{" "}
                  {String(ultimoReporte.hora).slice(0, 8)}
                </p>
              )}

              {ultimoReporte.direccion && (
                <p className="mb-2 text-sm text-gray-300">
                  <strong>Dirección:</strong> {ultimoReporte.direccion}
                </p>
              )}

              <p className="mb-0 text-gray-200">
               {ultimoReporte.delito || "Delito"}
              </p>
            </>
          ) : (
            <p className="mb-0 text-sm text-gray-300">
              No hay hechos delictivos registrados en tu zona.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReporteMapa;
