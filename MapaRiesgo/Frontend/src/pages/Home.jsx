
import { useEffect, useState } from "react";

import AccionesRapidas from "../components/AccionesRapidas";
import InformacionMapa from "../components/InformacionMapa";
import UltimoIncidente from "../components/UltimoIncidente";
import Footer from "../components/Footer";

function Home() {
  const [incidenteReciente, setIncidenteReciente] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerUltimoReporte = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3000/api/reportes/ultimo"
        );

        if (!respuesta.ok) {
          throw new Error("No se puede obtener el ultimo reporte");
        }

        const datos = await respuesta.json();

        setIncidenteReciente(datos);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerUltimoReporte();
  }, []);

  return (
    <div>
      <main className="mx-auto mt-6 w-full max-w-6xl space-y-6 px-4 pb-10">
        {cargando ? (
          <p className="text-white">Cargando último incidente...</p>
        ) : incidenteReciente ? (
          <UltimoIncidente incidente={incidenteReciente} />
        ) : (
          <p className="text-white">No hay incidentes registrados.</p>
        )}

        <AccionesRapidas />

        <InformacionMapa
          titulo="¿Qué es el mapa de riesgo?"
          descripcion="Texto sobre el mapa Lorem ipsum dolor sit amet consectetur adipisicing"
        />

        <div className="mt-25">
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Home;
