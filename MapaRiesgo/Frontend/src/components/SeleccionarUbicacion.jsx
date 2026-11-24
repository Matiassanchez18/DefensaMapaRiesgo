
import { useMapEvents } from "react-leaflet";

function SeleccionarUbicacion({ finalizarSeleccion }) {
  useMapEvents({
    click(e) {
      const coordenadas = [
        e.latlng.lat,
        e.latlng.lng,
      ];

      finalizarSeleccion(coordenadas);
    },
  });

  return null;
}

export default SeleccionarUbicacion;
