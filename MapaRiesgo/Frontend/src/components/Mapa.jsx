import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";

import "leaflet/dist/leaflet.css";
import "../Style/Mapa.css";

import Comisarias from "./Comisarias";
import ZonasRiesgo from "./zonasRiesgo";
import ReporteMapa from "./ReporteMapa";
import Formulario from "./Formulario";
import Footer from "./Footer";
import UbicacionUsuario from "./UbicacionUsuario";
import SeleccionarUbicacion from "./SeleccionarUbicacion";
import useAuthStore from "../store/Store";

const CENTRO_TUCUMAN = [-26.8241, -65.2226];

function Mapa() {
  const inicioSesion = useAuthStore((state) => state.inicioSesion);
  const navigate = useNavigate();

  const [siguiendoUbicacion, setSiguiendoUbicacion] = useState(true);
  const [modal, setModal] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const [errorGPS, setErrorGPS] = useState("");

  const [posicionSeleccionada, setPosicionSeleccionada] = useState(null);
  const [seleccionandoUbicacion, setSeleccionandoUbicacion] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [posicionBusqueda, setPosicionBusqueda] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorGPS("Tu navegador no permite utilizar la geolocalización.");
      return;
    }

    if (!window.isSecureContext) {
      setErrorGPS(
        "La conexión no es segura. Necesitás abrir la web mediante HTTPS.",
      );
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const nuevaUbicacion = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setErrorGPS("");
        setUbicacion(nuevaUbicacion);
      },
      (error) => {
        console.log("ERROR GPS:", error.code, error.message);

        switch (error.code) {
          case 1:
            setErrorGPS(
              "Permiso de ubicación denegado. Revisá los permisos del navegador.",
            );
            break;
          case 2:
            setErrorGPS(
              "No se pudo determinar la ubicación. Revisá que el GPS esté activado.",
            );
            break;
          case 3:
            setErrorGPS(
              "Se agotó el tiempo de espera para obtener tu ubicación.",
            );
            break;
          default:
            setErrorGPS("Ocurrió un error al obtener tu ubicación.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 60000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, []);

  useEffect(() => {
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

    const detenerSeguimiento = () => {
      setSiguiendoUbicacion(false);
    };

    mapa.addEventListener("mousedown", bloquearScroll);
    mapa.addEventListener("mouseleave", habilitarScroll);
    document.addEventListener("mouseup", habilitarScroll);

    mapa.addEventListener("dragstart", detenerSeguimiento);

    return () => {
      mapa.removeEventListener("mousedown", bloquearScroll);
      mapa.removeEventListener("mouseleave", habilitarScroll);
      document.removeEventListener("mouseup", habilitarScroll);

      mapa.removeEventListener("dragstart", detenerSeguimiento);

      habilitarScroll();
    };
  }, []);

  const buscarDireccion = async (e) => {
    e.preventDefault();

    if (!busqueda.trim()) {
      setErrorBusqueda("Escribí una dirección para buscar.");
      return;
    }

    try {
      setCargandoBusqueda(true);
      setErrorBusqueda("");
      setResultados([]);

      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=ar&q=${encodeURIComponent(
        busqueda.trim(),
      )}`;

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error("No se pudo realizar la búsqueda.");
      }

      const datos = await respuesta.json();

      if (datos.length === 0) {
        setErrorBusqueda("No encontramos esa dirección.");
        return;
      }

      setResultados(datos);
    } catch (error) {
      console.error("Error al buscar dirección:", error);
      setErrorBusqueda("Ocurrió un error al buscar. Intentá nuevamente.");
    } finally {
      setCargandoBusqueda(false);
    }
  };

  const seleccionarResultado = (resultado) => {
    const coordenadas = [Number(resultado.lat), Number(resultado.lon)];

    setPosicionBusqueda(coordenadas);
    setBusqueda(resultado.display_name);
    setResultados([]);
    setErrorBusqueda("");
  };

  const darValor = (dato) => {
    setModal(dato);

    if (!dato) {
      setSeleccionandoUbicacion(false);
    }
  };

  const modalHandle = () => {
    if (!inicioSesion) {
      alert("Tenés que iniciar sesión para realizar un reporte.");
      navigate("/login");
      return;
    }

    setModal(!modal);

    if (modal) {
      setSeleccionandoUbicacion(false);
    }
  };

  const seleccionarEnMapa = () => {
    setModal(false);
    setSeleccionandoUbicacion(true);
  };

  const finalizarSeleccion = (coordenadas) => {
    if (!inicioSesion) {
      alert("Tenés que iniciar sesión para realizar un reporte.");
      navigate("/login");
      return;
    }

    setPosicionSeleccionada(coordenadas);
    setSeleccionandoUbicacion(false);
    setModal(true);
  };

  const coordenadasReporte = posicionSeleccionada || ubicacion;

  function MoverMapa({ posicion, detenerSeguimiento }) {
    const mapa = useMap();

    useEffect(() => {
      if (posicion) {
        detenerSeguimiento();
        mapa.setView(posicion, 17, { animate: true });
      }
    }, [posicion, mapa, detenerSeguimiento]);

    return null;
  }

  return (
    <div>
      <div>
        {/* BÚSQUEDA: se oculta mientras el formulario está abierto */}
        {!modal && (
          <div className="relative z-[1100] mx-auto mt-2 w-full max-w-xl p-2">
            <form onSubmit={buscarDireccion} className="flex w-full">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar zona o dirección en Tucumán..."
                aria-label="Buscar zona o dirección"
                className="min-w-0 flex-1 rounded-l-lg border border-gray-600 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={cargandoBusqueda}
                aria-label="Buscar"
                className="rounded-r-lg border border-gray-500 bg-[#032f5c] px-4 py-2 text-white transition hover:bg-[#064078] disabled:opacity-50"
              >
                {cargandoBusqueda ? (
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                ) : (
                  <i className="bi bi-search"></i>
                )}
              </button>
            </form>

            {errorBusqueda && (
              <p className="mt-2 rounded-lg bg-white p-3 text-sm text-red-600 shadow">
                {errorBusqueda}
              </p>
            )}

            {resultados.length > 0 && (
              <div className="absolute left-2 right-2 top-full mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                {resultados.map((resultado) => (
                  <button
                    key={resultado.place_id}
                    type="button"
                    onClick={() => seleccionarResultado(resultado)}
                    className="flex w-full items-start gap-3 border-b border-gray-100 p-3 text-left text-sm text-gray-800 transition hover:bg-gray-100 last:border-b-0"
                  >
                    <i className="bi bi-geo-alt-fill mt-1 text-blue-600"></i>
                    <span>{resultado.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mapa-container">
          <div className="contendor-mapa">
            <MapContainer
              center={ubicacion || CENTRO_TUCUMAN}
              zoom={ubicacion ? 17 : 13}
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

              <Comisarias />

              <MoverMapa
                posicion={posicionBusqueda}
                detenerSeguimiento={() => setSiguiendoUbicacion(false)}
              />

              {ubicacion && (
                <UbicacionUsuario
                  posicion={ubicacion}
                  siguiendo={siguiendoUbicacion}
                />
              )}
              <ZonasRiesgo
                seleccionandoUbicacion={seleccionandoUbicacion}
                finalizarSeleccion={finalizarSeleccion}
              />

              {ubicacion && <UbicacionUsuario posicion={ubicacion} />}

              {seleccionandoUbicacion && (
                <SeleccionarUbicacion finalizarSeleccion={finalizarSeleccion} />
              )}

              {posicionSeleccionada && (
                <CircleMarker
                  center={posicionSeleccionada}
                  radius={9}
                  pathOptions={{
                    color: "white",
                    fillColor: "#ef4444",
                    fillOpacity: 1,
                    weight: 3,
                  }}
                />
              )}

              {posicionBusqueda && (
                <CircleMarker
                  center={posicionBusqueda}
                  radius={10}
                  pathOptions={{
                    color: "white",
                    fillColor: "#16a34a",
                    fillOpacity: 1,
                    weight: 3,
                  }}
                />
              )}
            </MapContainer>

            {!ubicacion && errorGPS && (
              <div className="absolute bottom-4 left-4 z-[1000] max-w-xs rounded-lg bg-white p-3 text-sm text-gray-800 shadow-lg">
                {errorGPS}
              </div>
            )}

            <button
              type="button"
              onClick={modalHandle}
              disabled={!ubicacion}
              className="botonReporte flex items-center gap-2 rounded-full bg-[#032f5c] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#064078] active:scale-95 disabled:opacity-50"
            >
              <i className="bi bi-plus-lg text-lg"></i>
              Reportar
            </button>

            <button
              type="button"
              onClick={() => {
                setPosicionBusqueda(null);
                setSiguiendoUbicacion(true);
              }}
              disabled={!ubicacion}
              className="absolute right-4 top-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-600 shadow-lg hover:bg-gray-100 disabled:opacity-50"
              title="Volver a mi ubicación"
            >
              <i className="bi bi-crosshair text-xl"></i>
            </button>

            <button
              type="button"
              aria-label="Agrandar mapa"
              className="btn-zoom flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-[#032f5c] text-lg text-white shadow-lg transition hover:bg-[#064078] active:scale-95"
            >
              <i className="bi bi-arrows-angle-expand"></i>
            </button>
          </div>

          {modal && ubicacion && inicioSesion && (
            <Formulario
              darValor={darValor}
              ubicacion={coordenadasReporte}
              seleccionarEnMapa={seleccionarEnMapa}
            />
          )}

          {seleccionandoUbicacion && (
            <div className="mx-auto mt-3 w-fit rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-lg">
              Hacé clic en el mapa para marcar el incidente
            </div>
          )}
        </div>
      </div>

      <div className="container card-reporte mx-auto mt-4 px-4">
        <ReporteMapa ubicacion={ubicacion} />
      </div>

      <Footer />
    </div>
  );
}

export default Mapa;
