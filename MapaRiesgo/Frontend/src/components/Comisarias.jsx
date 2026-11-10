
import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

function Comisarias() {
  const [comisarias, setComisarias] = useState([]);


const API_URL = "http://localhost:3000/api/comisarias";

const iconoPolicia = L.divIcon({
  className: "dependencia-marcador",
  html: `
    <div style="
      width: 40px;
      height: 40px;
      border: 2px solid #2563eb;
      border-radius: 50%;
      background: white;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    ">
      <img
        src="/policia.png"
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        "
      />
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
});


  useEffect(() => {
    const obtenerDependencias = async () => {
      try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
          throw new Error("Error al obtener dependencias");
        }

        const datos = await respuesta.json();
        setComisarias(datos);
      } catch (error) {
        console.error("Error al cargar comisarías:", error);
      }
    };

    obtenerDependencias();
  }, []);

  return (
    <>
      {comisarias.map((comisaria) => {
        const latitud = Number(comisaria.latitud);
        const longitud = Number(comisaria.longitud);

        if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
          return null;
        }

        const esPuesto = (comisaria.tipo || "")
          .toLowerCase()
          .includes("puesto");

        return (
          <Marker
            key={comisaria.id_comisaria}
            position={[latitud, longitud]}
            icon={iconoPolicia}
          >
            <Popup>
              <div className="popup-dependencia">
                <h3>{comisaria.nombre || "Dependencia policial"}</h3>

                <span className={esPuesto ? "tipo-puesto" : "tipo-comisaria"}>
                  {esPuesto ? "Puesto policial" : "Comisaría"}
                </span>

                {comisaria.direccion && (
                  <p><strong>Dirección:</strong> {comisaria.direccion}</p>
                )}

                {comisaria.localidad && (
                  <p><strong>Localidad:</strong> {comisaria.localidad}</p>
                )}

                {comisaria.telefono && (
                  <p><strong>Teléfono:</strong> {comisaria.telefono}</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default Comisarias;
