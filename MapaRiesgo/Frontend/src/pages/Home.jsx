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
          // "http://localhost:3000/api/reportes/ultimo"
          "http://10.0.2.2:3000/api/reportes/ultimo",
        );

        if (!respuesta.ok) {
          throw new Error("No se puede obtener el ultimo reporte");
        }

        const datos = await respuesta.json();

        setIncidenteReciente(datos);
      } catch (error) {
        console.error("Error al obtener el último reporte:", error);
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
          <p className="text-white">
            Cargando último incidente...</p>
        ) : incidenteReciente ? (
          <UltimoIncidente incidente={incidenteReciente} />
        ) : (
          <p className="text-white">No hay incidentes registrados.</p>
        )}

        <AccionesRapidas />

        <InformacionMapa
          titulo="¿Qué es el mapa de riesgo?"
          descripcion="El Mapa de Riesgo es una herramienta que permite identificar y visualizar las zonas de una ciudad según su nivel de inseguridad, a partir de los reportes de delitos registrados por los usuarios. Su objetivo es brindar información útil para que los ciudadanos puedan tomar decisiones más seguras, prevenir situaciones de riesgo y conocer las zonas que requieren mayor atención."
        />

        <div className="mt-25">
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Home;
