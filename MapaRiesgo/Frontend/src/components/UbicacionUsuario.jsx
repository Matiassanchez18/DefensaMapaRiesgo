
import { useEffect } from "react";
import { useMap, CircleMarker, Circle, Popup } from "react-leaflet";

function UbicacionUsuario({ posicion }) {
  const mapa = useMap();

  useEffect(() => {
    if (!posicion) return;

    mapa.panTo(posicion, {
      animate: true,
      duration: 0.5,
    });
  }, [posicion, mapa]);

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
