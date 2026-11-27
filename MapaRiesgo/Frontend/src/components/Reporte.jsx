
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import useAuthStore from "../store/Store";
import "../style/Formulario.css";

const CENTRO_TUCUMAN = [-26.8241, -65.2226];

// Centrar mapa en la ubicación seleccionada
function CentrarMapa({ ubicacion }) {
  const mapa = useMap();

  useEffect(() => {
    if (ubicacion) {
      mapa.setView(ubicacion, 17);
    }
  }, [ubicacion, mapa]);

  return null;
}

// Obtener dirección desde coordenadas
async function obtenerDireccion(latitud, longitud) {
  const respuesta = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitud}&lon=${longitud}&zoom=18&addressdetails=1`
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo obtener la dirección.");
  }

  const datos = await respuesta.json();

  return datos.display_name || "";
}

// Seleccionar punto en el mapa
function SeleccionarPunto({ finalizarSeleccion }) {
  useMapEvents({
    click: (e) => {
      finalizarSeleccion([
        e.latlng.lat,
        e.latlng.lng,
      ]);
    },
  });

  return null;
}

function Reporte() {
  const [ubicacion, setUbicacion] = useState(null);
  const [ubicacionGPS, setUbicacionGPS] = useState(null);
  const [direccion, setDireccion] = useState("");

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
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("info");

  const [mostrarMapa, setMostrarMapa] = useState(false);

  const [obteniendoGPS, setObteniendoGPS] = useState(
    () => "geolocation" in navigator
  );

  const [seleccionManualMapa, setSeleccionManualMapa] = useState(false);

  const solicitudDireccion = useRef(0);

  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  // Mostrar mensajes
  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  };

  // Validar nombre y apellido
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

  // Validar teléfono
  const validarTelefono = (valor) => {
    if (!valor.trim()) return "El teléfono es obligatorio.";

    if (!/^\d{10}$/.test(valor)) {
      return "El teléfono debe tener exactamente 10 dígitos.";
    }

    return "";
  };

  // Manejar nombre y apellido del testigo
  const manejarNombreTestigo = (e, campo) => {
    const valor = e.target.value.replace(
      /[^\p{L} '\u2019-]/gu,
      ""
    );

    setDatosTestigo((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setErroresTestigo((prev) => ({
      ...prev,
      [campo]: validarNombre(valor),
    }));
  };

  // Manejar teléfono
  const manejarTelefonoTestigo = (e) => {
    const valor = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setDatosTestigo((prev) => ({
      ...prev,
      telefono_testigo: valor,
    }));

    setErroresTestigo((prev) => ({
      ...prev,
      telefono_testigo: validarTelefono(valor),
    }));
  };

  // Cargar reportes existentes
  const cargarReportes = useCallback(async () => {
    try {
      const respuesta = await fetch(
        "http://localhost:3000/api/reportes"
      );

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

  // Obtener GPS para centrar el mapa
  useEffect(() => {
    if (!navigator.geolocation) {
      setObteniendoGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setUbicacionGPS([
          posicion.coords.latitude,
          posicion.coords.longitude,
        ]);

        setObteniendoGPS(false);
      },
      () => {
        mostrarMensaje(
          "No se pudo obtener el GPS. Podés buscar una dirección o seleccionar el lugar en el mapa.",
          "info"
        );

        setObteniendoGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0,
      }
    );
  }, []);

  // Buscar dirección escrita
  const buscarDireccion = async () => {
    if (!direccion.trim()) {
      mostrarMensaje("Ingresá una dirección para buscar.", "error");
      return;
    }

    const numeroSolicitud = ++solicitudDireccion.current;

    try {
      setBuscandoDireccion(true);
      mostrarMensaje("Buscando dirección...", "info");

      const consulta = `${direccion.trim()}, Tucumán, Argentina`;

      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=ar&q=${encodeURIComponent(consulta)}`
      );

      if (!respuesta.ok) {
        throw new Error("Error al buscar la dirección.");
      }

      const resultados = await respuesta.json();

      if (numeroSolicitud !== solicitudDireccion.current) return;

      if (resultados.length === 0) {
        setUbicacion(null);
        setSeleccionManualMapa(false);

        mostrarMensaje(
          "No se encontró esa dirección. Probá con otra.",
          "error"
        );

        return;
      }

      const resultado = resultados[0];

      const coordenadas = [
        Number(resultado.lat),
        Number(resultado.lon),
      ];

      if (
        !Number.isFinite(coordenadas[0]) ||
        !Number.isFinite(coordenadas[1])
      ) {
        throw new Error("La ubicación encontrada no es válida.");
      }

      setUbicacion(coordenadas);
      setSeleccionManualMapa(true);
      setDireccion(resultado.display_name);
      setMostrarMapa(true);

      mostrarMensaje(
        "Dirección encontrada correctamente.",
        "success"
      );
    } catch (error) {
      if (numeroSolicitud === solicitudDireccion.current) {
        console.error("Error al buscar dirección:", error);
        mostrarMensaje(error.message, "error");
      }
    } finally {
      if (numeroSolicitud === solicitudDireccion.current) {
        setBuscandoDireccion(false);
      }
    }
  };

  // Seleccionar ubicación haciendo clic en el mapa
  const finalizarSeleccion = async (coordenadas) => {
    const numeroSolicitud = ++solicitudDireccion.current;

    setUbicacion(coordenadas);
    setSeleccionManualMapa(true);
    setDireccion("");

    setBuscandoDireccion(true);

    mostrarMensaje("Obteniendo dirección...", "info");

    try {
      const direccionEncontrada = await obtenerDireccion(
        coordenadas[0],
        coordenadas[1]
      );

      if (numeroSolicitud !== solicitudDireccion.current) return;

      if (direccionEncontrada) {
        setDireccion(direccionEncontrada);

        mostrarMensaje(
          "Dirección seleccionada correctamente.",
          "success"
        );
      } else {
        mostrarMensaje(
          "No se encontró una dirección para ese punto. Podés escribirla manualmente.",
          "error"
        );
      }
    } catch (error) {
      if (numeroSolicitud === solicitudDireccion.current) {
        console.error("Error al obtener dirección:", error);

        mostrarMensaje(
          "Se seleccionó el punto, pero no se pudo obtener su dirección.",
          "error"
        );
      }
    } finally {
      if (numeroSolicitud === solicitudDireccion.current) {
        setBuscandoDireccion(false);
      }
    }
  };

  // Modificar dirección manualmente
  const manejarDireccion = (e) => {
    solicitudDireccion.current++;

    setDireccion(e.target.value);
    setUbicacion(null);
    setSeleccionManualMapa(false);
    setBuscandoDireccion(false);

    mostrarMensaje("", "info");
  };

  // Enviar reporte
  const handleSubmit = async (e) => {
    e.preventDefault();

    mostrarMensaje("", "info");

    if (!token) {
      mostrarMensaje(
        "Tenés que iniciar sesión para realizar un reporte.",
        "error"
      );
      return;
    }

    if (buscandoDireccion) {
      mostrarMensaje(
        "Esperá a que termine la búsqueda de ubicación.",
        "error"
      );
      return;
    }

    const ubicacionFinal = ubicacion;

    if (!ubicacionFinal) {
      mostrarMensaje(
        "Ingresá una dirección y buscala, o seleccioná un punto en el mapa.",
        "error"
      );
      return;
    }

    if (!direccion.trim()) {
      mostrarMensaje("La dirección es obligatoria.", "error");
      return;
    }

    const datosFormulario = new FormData(e.target);

    // Validar testigos
    if (testigos) {
      const nuevosErrores = {
        nombre_testigo: validarNombre(
          datosTestigo.nombre_testigo
        ),
        apellido_testigo: validarNombre(
          datosTestigo.apellido_testigo
        ),
        telefono_testigo: validarTelefono(
          datosTestigo.telefono_testigo
        ),
      };

      setErroresTestigo(nuevosErrores);

      if (Object.values(nuevosErrores).some((error) => error !== "")) {
        return;
      }
    }

    const reporte = {
      id_delito: Number(datosFormulario.get("id_delito")),

      direccion: direccion.trim(),

      descripcion: datosFormulario
        .get("descripcion")
        .trim(),

      testigos,

      nombre_testigo: testigos
        ? datosTestigo.nombre_testigo.trim()
        : null,

      apellido_testigo: testigos
        ? datosTestigo.apellido_testigo.trim()
        : null,

      telefono_testigo: testigos
        ? datosTestigo.telefono_testigo.trim()
        : null,

      latitud: Number(ubicacionFinal[0]),
      longitud: Number(ubicacionFinal[1]),
    };

    try {
      setCargando(true);

      const respuesta = await fetch(
        "http://localhost:3000/api/reportes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reporte),
        }
      );

      const resultado = await respuesta.json();

      if (respuesta.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      if (!respuesta.ok) {
        if (resultado.errores?.length > 0) {
          throw new Error(
            resultado.errores
              .map((error) => `${error.campo}: ${error.mensaje}`)
              .join("\n")
          );
        }

        throw new Error(
          resultado.mensaje || "Error al enviar el reporte."
        );
      }

      mostrarMensaje(
        "¡Reporte enviado correctamente!",
        "success"
      );

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

      setDireccion("");
      setUbicacion(null);
      setSeleccionManualMapa(false);
      setMostrarMapa(false);

      solicitudDireccion.current++;

      await cargarReportes();
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      mostrarMensaje(error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="reporte">
      <div className="reporte-card p-59">

        {/* ENCABEZADO */}
        <div className="reporte-header">
          <h2>Realizar reporte</h2>
          <p>Completá los datos del hecho ocurrido</p>
        </div>

        <form className="reporte-form" onSubmit={handleSubmit}>

          {/* TIPO DE DELITO */}
          <div className="reporte-campo">
            <label htmlFor="id_delito">
              Tipo de delito
            </label>

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

          {/* UBICACIÓN */}
          <section className="ubicacion-card">

            <div className="ubicacion-encabezado">
              <div className="ubicacion-icono">
                <i className="bi bi-geo-alt-fill"></i>
              </div>

              <div>
                <h3>Ubicación del incidente</h3>
                <p>Indicá dónde ocurrió el hecho</p>
              </div>
            </div>

            <label htmlFor="direccion">
              Agregar dirección o buscar en el mapa
            </label>

            <div className="direccion-input">
              <i className="bi bi-search"></i>

              <input
                type="text"
                id="direccion"
                name="direccion"
                placeholder="Ej: San Martín 450, Tucumán"
                value={direccion}
                onChange={manejarDireccion}
                required
              />
            </div>

            <button
              type="button"
              className="btn-buscar-direccion"
              onClick={buscarDireccion}
              disabled={buscandoDireccion}
            >
              <i className="bi bi-search"></i>

              {buscandoDireccion
                ? "Buscando..."
                : "Buscar dirección"}
            </button>

            <div className="ubicacion-separador">
              <span>O también podés</span>
            </div>

            <button
              type="button"
              className="btn-abrir-mapa"
              onClick={() => {
                setMostrarMapa(true);

                mostrarMensaje(
                  "Hacé clic en el mapa para seleccionar el lugar del incidente.",
                  "info"
                );
              }}
            >
              <span>
                <i className="bi bi-map"></i>
                Seleccionar ubicación en el mapa
              </span>

              <i className="bi bi-chevron-right"></i>
            </button>

            {ubicacion && (
              <div className="ubicacion-confirmada">
                <i className="bi bi-check-circle-fill"></i>
                <span>Ubicación seleccionada correctamente</span>
              </div>
            )}

            {/* MAPA */}
            {mostrarMapa && (
              <div className="mapa-contenedor">

                <div className="mapa-titulo">
                  <div>
                    <h4>Seleccioná el lugar</h4>
                    <p>Hacé clic sobre el mapa para marcarlo</p>
                  </div>

                  <button
                    type="button"
                    className="btn-cerrar-mapa"
                    onClick={() => setMostrarMapa(false)}
                    aria-label="Cerrar mapa"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="mapa-interactivo">
                  <MapContainer
                    center={
                      ubicacion ||
                      ubicacionGPS ||
                      CENTRO_TUCUMAN
                    }
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
                      attribution="&copy; OpenStreetMap"
                    />

                    <CentrarMapa ubicacion={ubicacion} />

                    <SeleccionarPunto
                      finalizarSeleccion={finalizarSeleccion}
                    />

                    {/* REPORTES EXISTENTES */}
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
                            <strong>
                              Reporte #{reporte.id_reporte}
                            </strong>

                            <p>
                              <strong>Dirección:</strong>{" "}
                              {reporte.direccion}
                            </p>

                            <p>
                              <strong>Descripción:</strong>{" "}
                              {reporte.descripcion}
                            </p>
                          </Popup>
                        </CircleMarker>
                      );
                    })}

                    {/* UBICACIÓN SELECCIONADA */}
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
                        <Popup>
                          Ubicación del nuevo reporte
                        </Popup>
                      </CircleMarker>
                    )}
                  </MapContainer>
                </div>

                <div className="mapa-ayuda">
                  <i className="bi bi-info-circle"></i>
                  <span>
                    Los puntos rojos son reportes y el azul es la ubicación seleccionada.
                  </span>
                </div>

              </div>
            )}

          </section>

          {/* TESTIGOS */}
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

          {/* DATOS DEL TESTIGO */}
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
                  onChange={(e) =>
                    manejarNombreTestigo(e, "nombre_testigo")
                  }
                  required
                />

                {erroresTestigo.nombre_testigo && (
                  <p className="error">
                    {erroresTestigo.nombre_testigo}
                  </p>
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
                  onChange={(e) =>
                    manejarNombreTestigo(e, "apellido_testigo")
                  }
                  required
                />

                {erroresTestigo.apellido_testigo && (
                  <p className="error">
                    {erroresTestigo.apellido_testigo}
                  </p>
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
                  <p className="error">
                    {erroresTestigo.telefono_testigo}
                  </p>
                )}
              </div>

            </div>
          )}

          {/* DESCRIPCIÓN */}
          <div className="reporte-campo">
            <label htmlFor="descripcion">
              Descripción del hecho
            </label>

            <textarea
              id="descripcion"
              name="descripcion"
              className="reporte-input-icono"
              placeholder="Contanos qué sucedió..."
              rows="4"
              required
            />
          </div>

          {/* ESTADO DE UBICACIÓN */}
          <div className="reporte-campo">
            <label>Estado de la ubicación</label>

            <p className="estado-ubicacion">
              {obteniendoGPS
                ? "Obteniendo GPS para centrar el mapa..."
                : ubicacion
                  ? seleccionManualMapa
                    ? "Lugar del incidente seleccionado."
                    : "Ubicación seleccionada."
                  : "Todavía no seleccionaste el lugar del incidente."}
            </p>
          </div>

          {/* MENSAJES */}
          {mensaje && (
            <div
              className={`reporte-mensaje reporte-mensaje-${tipoMensaje}`}
              role="status"
            >
              <i
                className={`bi ${
                  tipoMensaje === "success"
                    ? "bi-check-circle-fill"
                    : tipoMensaje === "error"
                      ? "bi-exclamation-circle-fill"
                      : "bi-info-circle-fill"
                }`}
              ></i>

              <span>{mensaje}</span>
            </div>
          )}

          {/* ENVIAR */}
          <div className="reporte-acciones">
            <button
              type="submit"
              className="reporte-btn-enviar"
              disabled={cargando || buscandoDireccion}
            >
              {cargando ? (
                <>
                  <span className="reporte-spinner"></span>
                  Enviando reporte...
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill"></i>
                  Enviar reporte
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Reporte;
