import { useState, useEffect, useRef, useCallback } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import useAuthStore from "../store/Store";
import "../style/Formulario.css";

const CENTRO_TUCUMAN = [-26.8241, -65.2226];

function SeleccionarPunto({ finalizarSeleccion }) {
  useMapEvents({
    click: (e) => {
      const coordenadas = [e.latlng.lat, e.latlng.lng];

      finalizarSeleccion(coordenadas);
    },
  });

  return null;
}

function Reporte() {
  const [ubicacion, setUbicacion] = useState(null);
  const [ubicacionGPS, setUbicacionGPS] = useState(null);

  const [reportes, setReportes] = useState([]);
  const [testigos, setTestigos] = useState(false);

  const [datosTestigo, setDatosTestigo] = useState({
    nombre_testigo: "",
    apellido_testigo: "",
    telefono_testigo: "",
  });

  const [erroresTestigo, setErroresTestigo] = useState({
    nombre_testigo: "",
    apellido_testigo: "",
    telefono_testigo: "",
  });

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [obteniendoGPS, setObteniendoGPS] = useState(true);

  const seleccionManual = useRef(false);

  const usuario = useAuthStore((state) => state.usuario);
  const validarNombre = (valor) => {
    if (!valor.trim()) return "Este campo es obligatorio.";

    if (valor.trim().length < 2) {
      return "Debe tener al menos 2 caracteres.";
    }

    if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(valor.trim())) {
      return "Ingresá solamente letras.";
    }

    return "";
  };

  const validarTelefono = (valor) => {
    if (!valor.trim()) return "El teléfono es obligatorio.";

    if (!/^\d{10}$/.test(valor)) {
      return "El teléfono debe tener exactamente 10 dígitos.";
    }

    return "";
  };

  const manejarNombreTestigo = (e, campo) => {
    const valor = e.target.value.replace(/[^\p{L} '\u2019-]/gu, "");

    setDatosTestigo((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setErroresTestigo((prev) => ({
      ...prev,
      [campo]: validarNombre(valor),
    }));
  };

  const manejarTelefonoTestigo = (e) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 10);

    setDatosTestigo((prev) => ({
      ...prev,
      telefono_testigo: valor,
    }));

    setErroresTestigo((prev) => ({
      ...prev,
      telefono_testigo: validarTelefono(valor),
    }));
  };

  const cargarReportes = useCallback(async () => {
    try {
      const respuesta = await fetch("http://localhost:3000/api/reportes");

      if (!respuesta.ok) {
        throw new Error("No se pudieron obtener los reportes.");
      }

      const datos = await respuesta.json();

      setReportes(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    }
  }, []);

  useEffect(() => {
    cargarReportes();

    const intervalo = setInterval(() => {
      cargarReportes();
    }, 5000);

    return () => clearInterval(intervalo);
  }, [cargarReportes]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setMensaje("Tu navegador no permite obtener la ubicación.");
      setObteniendoGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const coordenadasGPS = [
          posicion.coords.latitude,
          posicion.coords.longitude,
        ];

        setUbicacionGPS(coordenadasGPS);

        if (!seleccionManual.current) {
          setUbicacion(coordenadasGPS);
        }

        setObteniendoGPS(false);
      },
      () => {
        setMensaje(
          "No se pudo obtener el GPS. Podés seleccionar la ubicación en el mapa.",
        );

        setObteniendoGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0,
      },
    );
  }, []);

  const seleccionarEnMapa = () => {
    setMensaje("");
    setMostrarMapa(true);
  };

  const finalizarSeleccion = (coordenadas) => {
    seleccionManual.current = true;

    setUbicacion(coordenadas);

    setMensaje("Ubicación seleccionada correctamente.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!usuario) {
      setMensaje("Tenés que iniciar sesión para realizar un reporte.");
      return;
    }

    const idUsuario = Number(usuario.id_usuario);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      console.error("Datos del usuario:", usuario);

      setMensaje("No se pudo identificar al usuario. Volvé a iniciar sesión.");

      return;
    }

    const ubicacionFinal = ubicacion || ubicacionGPS;

    if (!ubicacionFinal) {
      setMensaje(
        "No se pudo obtener tu ubicación. Activá el GPS o seleccioná un punto en el mapa.",
      );
      return;
    }

    const datosFormulario = new FormData(e.target);
    if (testigos) {
      const nuevosErrores = {
        nombre_testigo: validarNombre(datosTestigo.nombre_testigo),
        apellido_testigo: validarNombre(datosTestigo.apellido_testigo),
        telefono_testigo: validarTelefono(datosTestigo.telefono_testigo),
      };

      setErroresTestigo(nuevosErrores);

      if (Object.values(nuevosErrores).some((error) => error !== "")) {
        return;
      }
    }

    const reporte = {
      id_usuario: idUsuario,
      id_delito: Number(datosFormulario.get("id_delito")),
      direccion: datosFormulario.get("direccion").trim(),
      descripcion: datosFormulario.get("descripcion").trim(),

      testigos: testigos,

      nombre_testigo: testigos ? datosTestigo.nombre_testigo.trim() : null,

      apellido_testigo: testigos ? datosTestigo.apellido_testigo.trim() : null,

      telefono_testigo: testigos ? datosTestigo.telefono_testigo.trim() : null,

      latitud: Number(ubicacionFinal[0]),
      longitud: Number(ubicacionFinal[1]),
    };

    try {
      setCargando(true);

      const respuesta = await fetch(
        // "http://localhost:3000/api/reportes" ,
        "http://localhost:3000/api/reportes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reporte),
        },
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        if (resultado.errores?.length > 0) {
          throw new Error(
            resultado.errores
              .map((error) => ${error.campo}: ${error.mensaje})
              .join("\n"),
          );
        }

        throw new Error(resultado.mensaje || "Error al enviar el reporte.");
      }

      alert("Reporte enviado correctamente.");

      e.target.reset();
      setTestigos(false);

      setDatosTestigo({
        nombre_testigo: "",
        apellido_testigo: "",
        telefono_testigo: "",
      });

      setErroresTestigo({
        nombre_testigo: "",
        apellido_testigo: "",
        telefono_testigo: "",
      });

      setUbicacion(ubicacionGPS);
      seleccionManual.current = false;

      await cargarReportes();
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="reporte">
      <div className="reporte-card p-59">
        <div className="reporte-header">
          <h2>Realizar reporte</h2>
          <p>Completá los datos del hecho ocurrido</p>
        </div>

        <form className="reporte-form" onSubmit={handleSubmit}>
          <div className="reporte-campo">
            <label htmlFor="id_delito">Tipo de delito</label>

            <select
              id="id_delito"
              name="id_delito"
              className="reporte-input-icono"
              required
            >
              <option value="">Seleccioná un delito</option>

              <option value="1">Robo</option>
              <option value="2">Hurto</option>
              <option value="3">Asalto</option>
              <option value="4">Vandalismo</option>
              <option value="5">Otro</option>
            </select>
          </div>

          <div className="reporte-campo">
            <label htmlFor="direccion">Dirección o referencia</label>

            <input
              type="text"
              id="direccion"
              name="direccion"
              className="reporte-input-icono"
              placeholder="Ej: Calle San Martín 450"
              required
            />
          </div>

          <div className="reporte-campo">
            <label>¿Hubo testigos?</label>

            <div className="reporte-opciones">
              <label className="reporte-opcion">
                <input
                  type="radio"
                  name="testigos"
                  value="si"
                  checked={testigos === true}
                  onChange={() => setTestigos(true)}
                  required
                />
                Sí
              </label>

              <label className="reporte-opcion">
                <input
                  type="radio"
                  name="testigos"
                  value="no"
                  checked={testigos === false}
                  onChange={() => {
                    setTestigos(false);

                    setDatosTestigo({
                      nombre_testigo: "",
                      apellido_testigo: "",
                      telefono_testigo: "",
                    });

                    setErroresTestigo({
                      nombre_testigo: "",
                      apellido_testigo: "",
                      telefono_testigo: "",
                    });
                  }}
                  required
                />
                No
              </label>
            </div>
          </div>

          {testigos && (
            <div className="reporte-campo">
              <h3>Datos del testigo</h3>

              <div className="reporte-campo">
                <label htmlFor="nombre_testigo">Nombre</label>

                <input
                  type="text"
                  id="nombre_testigo"
                  name="nombre_testigo"
                  className="reporte-input-icono"
                  placeholder="Nombre del testigo"
                  value={datosTestigo.nombre_testigo}
                  onChange={(e) => manejarNombreTestigo(e, "nombre_testigo")}
                  required
                />

                {erroresTestigo.nombre_testigo && (
                  <p className="error">{erroresTestigo.nombre_testigo}</p>
                )}
              </div>

              <div className="reporte-campo">
                <label htmlFor="apellido_testigo">Apellido</label>

                <input
                  type="text"
                  id="apellido_testigo"
                  name="apellido_testigo"
                  className="reporte-input-icono"
                  placeholder="Apellido del testigo"
                  value={datosTestigo.apellido_testigo}
                  onChange={(e) => manejarNombreTestigo(e, "apellido_testigo")}
                  required
                />

                {erroresTestigo.apellido_testigo && (
                  <p className="error">{erroresTestigo.apellido_testigo}</p>
                )}
              </div>

              <div className="reporte-campo">
                <label htmlFor="telefono_testigo">Teléfono</label>

                <input
                  type="tel"
                  id="telefono_testigo"
                  name="telefono_testigo"
                  className="reporte-input-icono"
                  placeholder="3815551234"
                  value={datosTestigo.telefono_testigo}
                  onChange={manejarTelefonoTestigo}
                  maxLength={10}
                  required
                />

                {erroresTestigo.telefono_testigo && (
                  <p className="error">{erroresTestigo.telefono_testigo}</p>
                )}
              </div>
            </div>
          )}

          <div className="reporte-campo">
            <label htmlFor="descripcion">Descripción del hecho</label>

            <textarea
              id="descripcion"
              name="descripcion"
              className="reporte-input-icono"
              placeholder="Contanos qué sucedió..."
              rows="4"
              required
            />
          </div>

          <div className="reporte-campo">
            <label>Ubicación del incidente</label>

            <p>
              {obteniendoGPS
                ? "Obteniendo ubicación GPS..."
                : ubicacion
                  ? seleccionManual.current
                    ? "Ubicación seleccionada en el mapa."
                    : "Se utilizará tu ubicación actual."
                  : ubicacionGPS
                    ? "Se utilizará tu ubicación actual."
                    : "Todavía no hay una ubicación disponible."}
            </p>

            <button
              type="button"
              className="reporte-input-icono"
              onClick={seleccionarEnMapa}
            >
              <i className="bi bi-geo-alt"></i>
              Seleccionar ubicación en el mapa
            </button>

            {mostrarMapa && (
              <div className="reporte-selector-mapa">
                <p>
                  Hacé clic sobre el mapa para marcar el lugar donde ocurrió el
                  incidente.
                </p>

                <div
                  style={{
                    width: "100%",
                    height: "350px",
                    marginTop: "10px",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <MapContainer
                    center={ubicacion || ubicacionGPS || CENTRO_TUCUMAN}
                    zoom={15}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                      attribution="OpenStreetMap"
                    />

                    <SeleccionarPunto finalizarSeleccion={finalizarSeleccion} />

                    {reportes.map((reporte, index) => {
                      const latitud = Number(reporte.latitud);
                      const longitud = Number(reporte.longitud);

                      if (
                        !Number.isFinite(latitud) ||
                        !Number.isFinite(longitud)
                      ) {
                        return null;
                      }

                      return (
                        <CircleMarker
                          key={reporte.id_reporte ?? index}
                          center={[latitud, longitud]}
                          radius={7}
                          pathOptions={{
                            color: "white",
                            fillColor: "#ef4444",
                            fillOpacity: 1,
                            weight: 2,
                          }}
                        >
                          <Popup>
                            <strong>Reporte #{reporte.id_reporte}</strong>

                            <p>
                              <strong>Dirección:</strong> {reporte.direccion}
                            </p>

                            <p>
                              <strong>Descripción:</strong>{" "}
                              {reporte.descripcion}
                            </p>
                          </Popup>
                        </CircleMarker>
                      );
                    })}

                    {ubicacion && (
                      <CircleMarker
                        center={ubicacion}
                        radius={9}
                        pathOptions={{
                          color: "white",
                          fillColor: "#2563eb",
                          fillOpacity: 1,
                          weight: 3,
                        }}
                      >
                        <Popup>Ubicación del nuevo reporte</Popup>
                      </CircleMarker>
                    )}
                  </MapContainer>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarMapa(false)}
                  style={{ marginTop: "10px" }}
                >
                  Cancelar selección
                </button>
              </div>
            )}
          </div>

          {mensaje && <p role="status">{mensaje}</p>}

          <div className="reporte-acciones">
            <button
              type="submit"
              className="reporte-btn-enviar"
              disabled={cargando || obteniendoGPS}
            >
              {cargando ? "Enviando..." : "Enviar reporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Reporte;