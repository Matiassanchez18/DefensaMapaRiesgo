import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../Style/Mapa.css";
import ReporteMapa from "./ReporteMapa";
import Formulario from "./Formulario";
import Footer from "./Footer";

function Mapa() {
  const [modal, setModal] = useState(false);
  const [valor, setValor] = useState(false);

  const darValor = (dato) => {
    setValor(dato);
    setModal(dato);
  };

  const modalHandle = () => {
    setModal(!modal);
  };
  console.log(valor);
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
            <MapContainer
              center={[-26.8241, -65.2226]}
              zoom={13}
              id="map"
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                attribution="OpenStreetMap"
              />
            </MapContainer>

            <button
              type="button"
              onClick={modalHandle}
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
          </div>
          {modal ? <Formulario darValor={darValor}></Formulario> : <></>}
        </div>
      </div>

      <div className="container card-reporte mx-auto px-4 mt-4">
       <ReporteMapa></ReporteMapa>
      </div>

      <div>
        <Footer></Footer>
      </div>
    </div>
  );
}

export default Mapa;
