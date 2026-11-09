
import { useEffect, useState } from "react";
import { useMap, CircleMarker, Circle, Popup } from "react-leaflet";

function UbicacionUsuario({ onUbicacionChange }) {
  const mapa = useMap();
  const [posicion, setPosicion] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Tu navegador no admite geolocalización");
      return;
    }

    const idSeguimiento = navigator.geolocation.watchPosition(
      (ubicacion) => {
        const lat = ubicacion.coords.latitude;
        const lng = ubicacion.coords.longitude;

        const coordenadas = [lat, lng];

        setPosicion(coordenadas);
        onUbicacionChange(coordenadas);

        mapa.setView(coordenadas, mapa.getZoom());
      },
      (error) => {
        console.error("Error al obtener ubicación:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(idSeguimiento);
    };
  }, [mapa, onUbicacionChange]);

  if (!posicion) return null;

  return (
    <>
      <Circle
        center={posicion}
        radius={100}
        pathOptions={{
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.15,
          weight: 2,
        }}
      />

      <CircleMarker
        center={posicion}
        radius={9}
        pathOptions={{
          color: "white",
          fillColor: "#2563eb",
          fillOpacity: 1,
          weight: 3,
        }}
      >
        <Popup>Tu ubicación actual</Popup>
      </CircleMarker>
    </>
  );
}

export default UbicacionUsuario;
