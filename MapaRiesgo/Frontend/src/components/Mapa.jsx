
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../Style/Mapa.css";

import ZonasRiesgo from "./zonasRiesgo";
import ReporteMapa from "./ReporteMapa";
import Formulario from "./Formulario";
import Footer from "./Footer";
import UbicacionUsuario from "./UbicacionUsuario";
import SeleccionarUbicacion from "./SeleccionarUbicacion";

function Mapa() {
  const [modal, setModal] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [errorGPS, setErrorGPS] = useState("");

  const [posicionSeleccionada, setPosicionSeleccionada] = useState(null);
  const [seleccionandoUbicacion, setSeleccionandoUbicacion] = useState(false);

  useEffect(() => {
    console.log("Geolocalización disponible:", !!navigator.geolocation);
    console.log("Contexto seguro:", window.isSecureContext);

    if (!navigator.geolocation) {
      setErrorGPS("Tu navegador no permite utilizar la geolocalización.");
      return;
    }

    if (!window.isSecureContext) {
      setErrorGPS(
        "La conexión no es segura. Necesitás abrir la web mediante HTTPS."
      );
      return;
    }

    console.log("Solicitando ubicación...");

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const nuevaUbicacion = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        console.log("Coordenadas recibidas:", nuevaUbicacion);

        setErrorGPS("");
        setUbicacion(nuevaUbicacion);
      },
      (error) => {
        console.log("ERROR GPS:", error.code, error.message);

        switch (error.code) {
          case 1:
            setErrorGPS(
              "Permiso de ubicación denegado. Revisá los permisos de Chrome."
            );
            break;
          case 2:
            setErrorGPS(
              "No se pudo determinar la ubicación. Revisá que el GPS esté activado."
            );
            break;
          case 3:
            setErrorGPS("Se agotó el tiempo de espera para obtener tu ubicación.");
            break;
          default:
            setErrorGPS("Ocurrió un error al obtener tu ubicación.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 60000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, []);

  useEffect(() => {
    if (!ubicacion) return;

    const mapa = document.querySelector(".leaflet-container");

    if (!mapa) return;

    const bloquearScroll = () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };

    const habilitarScroll = () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };

    mapa.addEventListener("mousedown", bloquearScroll);
    mapa.addEventListener("mouseleave", habilitarScroll);
    document.addEventListener("mouseup", habilitarScroll);

    return () => {
      mapa.removeEventListener("mousedown", bloquearScroll);
      mapa.removeEventListener("mouseleave", habilitarScroll);
      document.removeEventListener("mouseup", habilitarScroll);
      habilitarScroll();
    };
  }, [ubicacion !== null]);

  const darValor = (dato) => {
    setModal(dato);
  };

  const modalHandle = () => {
    setModal(!modal);
  };

  const seleccionarEnMapa = () => {
    setModal(false);
    setSeleccionandoUbicacion(true);
  };

  const finalizarSeleccion = (coordenadas) => {
    setPosicionSeleccionada(coordenadas);
    setSeleccionandoUbicacion(false);
    setModal(true);
  };

  // Si hay un punto marcado manualmente, tiene prioridad.
  // Si no, se utilizan las coordenadas del GPS.
  const coordenadasReporte = posicionSeleccionada || ubicacion;

  return (
    <div>
      <div>
        <div className="flex w-full max-w-xl mx-auto p-2 mt-2">
          <input
            type="text"
            placeholder="Buscar zona o dirección"
            aria-label="Buscar zona o dirección"
            className="flex-1 min-w-0 rounded-l-lg border border-gray-600 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <button
            type="button"
            aria-label="Buscar"
            className="rounded-r-lg border border-gray-500 bg-transparent px-4 py-2 text-gray-300 transition hover:bg-gray-700 hover:text-white"
          >
            <i className="bi bi-search"></i>
          </button>
        </div>

        <div className="mapa-container">
          <div className="contendor-mapa">
            {ubicacion ? (
              <MapContainer
                center={ubicacion}
                zoom={17}
                id="map"
                scrollWheelZoom={true}
                dragging={true}
                touchZoom={true}
                doubleClickZoom={true}
                keyboard={true}
              >
                <TileLayer
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                  attribution="OpenStreetMap"
                />

                <ZonasRiesgo />

                <UbicacionUsuario posicion={ubicacion} />

                {seleccionandoUbicacion && (
                  <SeleccionarUbicacion
                    finalizarSeleccion={finalizarSeleccion}
                  />
                )}

                {posicionSeleccionada && (
                  <Marker position={posicionSeleccionada} />
                )}
              </MapContainer>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 text-white">
                <p>{errorGPS || "Obteniendo tu ubicación..."}</p>

                {errorGPS && (
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                  >
                    Volver a intentar
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={modalHandle}
              disabled={!ubicacion}
              className="botonReporte flex items-center gap-2 rounded-full bg-[#032f5c] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#064078] active:scale-95"
            >
              <i className="bi bi-plus-lg text-lg"></i>
              Reportar
            </button>

            <button
              type="button"
              aria-label="Agrandar mapa"
              className="btn-zoom flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-[#032f5c] text-lg text-white shadow-lg transition hover:bg-[#064078] active:scale-95"
            >
              <i className="bi bi-arrows-angle-expand"></i>
            </button>

            {seleccionandoUbicacion && (
              <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-lg">
                Hacé clic en el mapa para marcar el incidente
              </div>
            )}
          </div>

          {modal && ubicacion && (
            <Formulario
              darValor={darValor}
              ubicacion={coordenadasReporte}
              seleccionarEnMapa={seleccionarEnMapa}
            />
          )}
        </div>
      </div>

      <div className="container card-reporte mx-auto px-4 mt-4">
        <ReporteMapa />
      </div>

      <Footer />
    </div>
  );
}

export default Mapa;
