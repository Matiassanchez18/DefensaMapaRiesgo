
import { useEffect, useState } from "react";
import { Polygon, Popup } from "react-leaflet";

const TAM_CELDA = 0.005;
const ANGULO = 12;

function colorZona(cantidad) {
  if (cantidad >= 12) return "#800000";
  if (cantidad >= 7) return "#ff9800";
  if (cantidad >= 4) return "#fdd835";
  return "#66bb6a";
}

function agruparPorCelda(reportes) {
  const celdas = {};

  reportes.forEach((reporte) => {
    const lat = Number(reporte.latitud);
    const lng = Number(reporte.longitud);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const fila = Math.floor(lat / TAM_CELDA);
    const columna = Math.floor(lng / TAM_CELDA);
    const clave = `${fila}_${columna}`;

    if (!celdas[clave]) {
      celdas[clave] = [];
    }

    celdas[clave].push(reporte);
  });

  return celdas;
}

function rotarPunto(cx, cy, x, y, angulo) {
  const rad = (angulo * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;

  return {
    lat: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    lng: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

function ZonasRiesgo({
  seleccionandoUbicacion,
  finalizarSeleccion,
}) {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const respuesta = await fetch("http://localhost:3000/api/reportes");

        if (!respuesta.ok) {
          throw new Error("No se pudieron obtener los reportes");
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

  const celdas = agruparPorCelda(reportes);

  return (
    <>
      {Object.entries(celdas).map(([clave, grupo]) => {
        const [fila, columna] = clave.split("_").map(Number);

        const sur = fila * TAM_CELDA;
        const oeste = columna * TAM_CELDA;
        const norte = sur + TAM_CELDA;
        const este = oeste + TAM_CELDA;

        const centroLat = (sur + norte) / 2;
        const centroLng = (oeste + este) / 2;

        const posiciones = [
          rotarPunto(centroLat, centroLng, sur, oeste, ANGULO),
          rotarPunto(centroLat, centroLng, sur, este, ANGULO),
          rotarPunto(centroLat, centroLng, norte, este, ANGULO),
          rotarPunto(centroLat, centroLng, norte, oeste, ANGULO),
        ].map((p) => [p.lat, p.lng]);

        const cantidad = grupo.length;
        const color = colorZona(cantidad);

        const nivel =
          cantidad >= 12
            ? "Alto"
            : cantidad >= 7
              ? "Medio-alto"
              : cantidad >= 4
                ? "Moderado"
                : "Bajo";

        return (
          <Polygon
            key={clave}
            positions={posiciones}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: (e) => {
                if (seleccionandoUbicacion) {
                  finalizarSeleccion([
                    e.latlng.lat,
                    e.latlng.lng,
                  ]);
                }
              },
            }}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.4,
              opacity: 0.8,
              weight: 1,
            }}
          >
            {!seleccionandoUbicacion && (
              <Popup>
                <strong>Zona de riesgo</strong>
                <br />
                Reportes registrados: {cantidad}
                <br />
                Nivel: {nivel}
                <br />
                <strong>Últimos reportes:</strong>

                {grupo.slice(-3).reverse().map((reporte) => (
                  <div key={reporte.id_reporte}>
                    <hr />
                    {reporte.descripcion}
                  </div>
                ))}
              </Popup>
            )}
          </Polygon>
        );
      })}
    </>
  );
}

export default ZonasRiesgo;
