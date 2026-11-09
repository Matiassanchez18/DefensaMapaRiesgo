
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

  // Ubicación elegida para el incidente
  const [posicionSeleccionada, setPosicionSeleccionada] = useState(null);

  // Activa o desactiva la selección mediante clic
  const [seleccionandoUbicacion, setSeleccionandoUbicacion] = useState(false);

  // Obtener y seguir la ubicación GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Tu navegador no admite geolocalización");
      return;
    }

    const idSeguimiento = navigator.geolocation.watchPosition(
      (resultado) => {
        const coordenadas = [
          resultado.coords.latitude,
          resultado.coords.longitude,
        ];

        setUbicacion(coordenadas);
      },
      (error) => {
        console.error("Error de geolocalización:", {
          codigo: error.code,
          mensaje: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 30000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(idSeguimiento);
    };
  }, []);

  // Controlar el desplazamiento de la página al arrastrar el mapa
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

  // Se ejecuta desde el botón del formulario
  const seleccionarEnMapa = () => {
    setModal(false);
    setSeleccionandoUbicacion(true);
  };

  // Se ejecuta cuando el usuario hace clic en el mapa
  const finalizarSeleccion = (coordenadas) => {
    setPosicionSeleccionada(coordenadas);
    setSeleccionandoUbicacion(false);
    setModal(true);
  };

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

                {/* Selección del punto del incidente */}
                {seleccionandoUbicacion && (
                  <SeleccionarUbicacion
                    finalizarSeleccion={finalizarSeleccion}
                  />
                )}

                {/* Marcador permanente del punto seleccionado */}
                {posicionSeleccionada && (
                  <Marker position={posicionSeleccionada} />
                )}
              </MapContainer>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center text-white">
                Obteniendo tu ubicación...
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
              ubicacion={posicionSeleccionada}
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
