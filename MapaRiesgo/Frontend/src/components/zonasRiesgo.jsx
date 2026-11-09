
import { useEffect, useState } from "react";
import { Polygon, Popup } from "react-leaflet";

const TAM_CELDA = 0.005;

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

function ZonasRiesgo() {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const cargarReportes = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/reportes"
        );

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
        const cantidad = grupo.length;

        // Calcular el centro de los reportes de la celda
        const latitudes = grupo.map((r) => Number(r.latitud));
        const longitudes = grupo.map((r) => Number(r.longitud));

        const centroLat =
          latitudes.reduce((a, b) => a + b, 0) / cantidad;

        const centroLng =
          longitudes.reduce((a, b) => a + b, 0) / cantidad;

        // Dibujar el cuadrado centrado en esa ubicación
        const mitad = TAM_CELDA / 2;

        const posiciones = [
          [centroLat - mitad, centroLng - mitad],
          [centroLat - mitad, centroLng + mitad],
          [centroLat + mitad, centroLng + mitad],
          [centroLat + mitad, centroLng - mitad],
        ];

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
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.4,
              opacity: 0.8,
              weight: 1,
            }}
          >
            <Popup>
              <strong>Zona de riesgo</strong>
              <br />
              Reportes registrados: {cantidad}
              <br />
              Nivel: {nivel}
              <br />
              Latitud: {centroLat.toFixed(6)}
              <br />
              Longitud: {centroLng.toFixed(6)}
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}

export default ZonasRiesgo;
