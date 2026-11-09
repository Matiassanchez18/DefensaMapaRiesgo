import { useEffect, useState } from "react";
import { CircleMarker, Popup } from "react-leaflet";

function Comisarias() {
  const [comisarias, setComisarias] = useState([]);

  useEffect(() => {
    const obtenerComisarias = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/comisarias"
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron obtener las dependencias");
        }

        const datos = await respuesta.json();
        setComisarias(datos);
      } catch (error) {
        console.error("Error al cargar comisarías:", error);
      }
    };

    obtenerComisarias();
  }, []);

  return (
    <>
      {comisarias.map((comisaria) => {
        const posicion = [
          Number(comisaria.latitud),
          Number(comisaria.longitud),
        ];

        if (
          !Number.isFinite(posicion[0]) ||
          !Number.isFinite(posicion[1])
        ) {
          return null;
        }

        const esComisaria = comisaria.tipo === "Comisaría";

        return (
          <CircleMarker
            key={comisaria.id_comisaria}
            center={posicion}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: esComisaria ? "#2563eb" : "#f59e0b",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <strong className="text-base">
                  {comisaria.nombre}
                </strong>

                <p className="mt-1 text-sm">
                  <strong>Tipo:</strong>{" "}
                  {comisaria.tipo || "Dependencia policial"}
                </p>

                {comisaria.direccion && (
                  <p className="text-sm">
                    <strong>Dirección:</strong>{" "}
                    {comisaria.direccion}
                  </p>
                )}

                {comisaria.localidad && (
                  <p className="text-sm">
                    <strong>Localidad:</strong>{" "}
                    {comisaria.localidad}
                  </p>
                )}

                {comisaria.telefono && (
                  <p className="text-sm">
                    <strong>Teléfono:</strong>{" "}
                    {comisaria.telefono}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default Comisarias;