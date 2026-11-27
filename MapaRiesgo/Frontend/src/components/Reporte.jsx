
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

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "leaflet/dist/leaflet.css";

import useAuthStore from "../store/Store";
import "../style/Formulario.css";

const CENTRO_TUCUMAN = [-26.8241, -65.2226];
const MIN_CARACTERES = 100;
const MAX_CARACTERES = 1000;

function CentrarMapa({ ubicacion }) {
  const mapa = useMap();

  useEffect(() => {
    if (ubicacion) {
      mapa.setView(ubicacion, 17);
    }
  }, [ubicacion, mapa]);

  return null;
}

// Obtener dirección desde coordenadas.
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

// Seleccionar punto en el mapa.
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
  const [errorDireccion, setErrorDireccion] = useState("");

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

  const [errorDelito, setErrorDelito] = useState("");
  const [errorDescripcion, setErrorDescripcion] = useState("");

  const [cargando, setCargando] = useState(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);

  const [
    obteniendoUbicacionActual,
    setObteniendoUbicacionActual,
  ] = useState(false);

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

  const mostrarMensaje = (texto, tipo = "info") => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  };

  // Validar nombre y apellido.
  const validarNombre = (valor) => {
    const texto = valor.trim();

    if (!texto) {
      return "Este campo es obligatorio.";
    }

    if (texto.length < 2) {
      return "Debe tener al menos 2 caracteres.";
    }

    if (texto.length > 100) {
      return "No puede superar los 100 caracteres.";
    }

    if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(texto)) {
      return "Ingresá solamente letras.";
    }

    return "";
  };

  // Validar teléfono.
  const validarTelefono = (valor) => {
    if (!valor.trim()) {
      return "El teléfono es obligatorio.";
    }

    if (!/^\d{10}$/.test(valor)) {
      return "El teléfono debe tener exactamente 10 dígitos.";
    }

    return "";
  };

  // Validar descripción.
  const validarDescripcion = (valor) => {
    const texto = valor.trim();

    if (!texto) {
      return "La descripción es obligatoria. Contanos qué sucedió.";
    }

    if (texto.length < MIN_CARACTERES) {
      return `La descripción debe tener al menos ${MIN_CARACTERES} caracteres. Actualmente tiene ${texto.length}.`;
    }

    if (texto.length > MAX_CARACTERES) {
      return `La descripción no puede superar los ${MAX_CARACTERES} caracteres.`;
    }

    return "";
  };

  // Manejar nombre y apellido.
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
      [campo]: valor.trim() ? validarNombre(valor) : "",
    }));
  };

  // Manejar teléfono.
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
      telefono_testigo: valor ? validarTelefono(valor) : "",
    }));
  };

  // Cargar reportes.
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

  // Obtener GPS para centrar el mapa inicialmente.
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

  // Buscar dirección.
  const buscarDireccion = async () => {
    const texto = direccion.trim();

    if (!texto) {
      setErrorDireccion("Ingresá una dirección para poder buscarla.");
      return;
    }

    setErrorDireccion("");
    setBuscandoDireccion(true);
    setMensaje("");

    const numeroSolicitud = ++solicitudDireccion.current;

    try {
      const consulta = texto.toLowerCase().includes("tucumán")
        ? texto
        : `${texto}, Tucumán, Argentina`;

      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        consulta
      )}&countrycodes=ar&limit=5&addressdetails=1&accept-language=es`;

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error("No se pudo realizar la búsqueda.");
      }

      const resultados = await respuesta.json();

      if (numeroSolicitud !== solicitudDireccion.current) return;

      if (!resultados || resultados.length === 0) {
        setUbicacion(null);
        setSeleccionManualMapa(false);

        setErrorDireccion(
          "No encontramos esa dirección. Probá ingresando una calle, altura o localidad."
        );

        return;
      }

      const resultado = resultados[0];

      const lat = Number(resultado.lat);
      const lng = Number(resultado.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("La ubicación encontrada no es válida.");
      }

      setUbicacion([lat, lng]);
      setDireccion(resultado.display_name);
      setSeleccionManualMapa(true);
      setMostrarMapa(true);
      setErrorDireccion("");

      mostrarMensaje(
        "Dirección encontrada correctamente.",
        "success"
      );
    } catch (error) {
      console.error("Error al buscar dirección:", error);

      setErrorDireccion(
        "Ocurrió un error al buscar la dirección. Intentá nuevamente."
      );
    } finally {
      if (numeroSolicitud === solicitudDireccion.current) {
        setBuscandoDireccion(false);
      }
    }
  };

  // Usar ubicación actual.
  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setErrorDireccion(
        "Tu navegador no permite obtener la ubicación."
      );
      return;
    }

    const numeroSolicitud = ++solicitudDireccion.current;

    setObteniendoUbicacionActual(true);
    setBuscandoDireccion(true);
    setErrorDireccion("");

    mostrarMensaje("Obteniendo tu ubicación actual...", "info");

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        try {
          const coordenadas = [
            posicion.coords.latitude,
            posicion.coords.longitude,
          ];

          if (numeroSolicitud !== solicitudDireccion.current) return;

          setUbicacion(coordenadas);
          setUbicacionGPS(coordenadas);
          setSeleccionManualMapa(true);
          setMostrarMapa(true);

          const direccionEncontrada = await obtenerDireccion(
            coordenadas[0],
            coordenadas[1]
          );

          if (numeroSolicitud !== solicitudDireccion.current) return;

          if (direccionEncontrada) {
            setDireccion(direccionEncontrada);
            setErrorDireccion("");

            mostrarMensaje(
              "Tu ubicación actual se seleccionó correctamente.",
              "success"
            );
          } else {
            setDireccion("");

            setErrorDireccion(
              "Se obtuvo tu ubicación, pero no encontramos una dirección. Podés escribirla manualmente."
            );

            mostrarMensaje("", "info");
          }
        } catch (error) {
          if (numeroSolicitud === solicitudDireccion.current) {
            console.error("Error al obtener dirección GPS:", error);

            setErrorDireccion(
              "Se obtuvo tu ubicación, pero no pudimos obtener la dirección."
            );

            mostrarMensaje("", "info");
          }
        } finally {
          if (numeroSolicitud === solicitudDireccion.current) {
            setObteniendoUbicacionActual(false);
            setBuscandoDireccion(false);
          }
        }
      },
      (error) => {
        if (numeroSolicitud !== solicitudDireccion.current) return;

        console.error("Error de geolocalización:", error);

        const mensajeError =
          error.code === 1
            ? "Tenés que permitir el acceso a tu ubicación desde el navegador."
            : error.code === 2
              ? "No pudimos determinar tu ubicación."
              : "Se agotó el tiempo para obtener tu ubicación.";

        setErrorDireccion(mensajeError);
        mostrarMensaje("", "info");
        setObteniendoUbicacionActual(false);
        setBuscandoDireccion(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0,
      }
    );
  };

  // Seleccionar punto en el mapa.
  const finalizarSeleccion = async (coordenadas) => {
    const numeroSolicitud = ++solicitudDireccion.current;

    setUbicacion(coordenadas);
    setSeleccionManualMapa(true);
    setDireccion("");
    setErrorDireccion("");

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
        setErrorDireccion("");

        mostrarMensaje(
          "Dirección seleccionada correctamente.",
          "success"
        );
      } else {
        setErrorDireccion(
          "No se encontró una dirección para ese punto. Podés escribirla manualmente."
        );

        mostrarMensaje("", "info");
      }
    } catch (error) {
      if (numeroSolicitud === solicitudDireccion.current) {
        console.error("Error al obtener dirección:", error);

        setErrorDireccion(
          "No se pudo obtener la dirección. Podés escribirla manualmente."
        );

        mostrarMensaje("", "info");
      }
    } finally {
      if (numeroSolicitud === solicitudDireccion.current) {
        setBuscandoDireccion(false);
      }
    }
  };

  // Manejar cambios en la dirección.
  const manejarDireccion = (e) => {
    solicitudDireccion.current++;

    setDireccion(e.target.value);
    setUbicacion(null);
    setSeleccionManualMapa(false);
    setBuscandoDireccion(false);
    setObteniendoUbicacionActual(false);
    setErrorDireccion("");

    mostrarMensaje("", "info");
  };

  // Enviar reporte.
  const handleSubmit = async (e) => {
    e.preventDefault();

    mostrarMensaje("", "info");

    setErrorDelito("");
    setErrorDescripcion("");
    setErrorDireccion("");

    const datosFormulario = new FormData(e.currentTarget);

    const idDelito = Number(datosFormulario.get("id_delito"));
    const descripcion =
      datosFormulario.get("descripcion")?.trim() || "";

    let hayErrores = false;

    // Validar tipo de delito.
    if (![1, 2, 3, 4, 5].includes(idDelito)) {
      setErrorDelito("Seleccioná un tipo de delito válido.");
      hayErrores = true;
    }

    // Validar dirección.
    if (!direccion.trim()) {
      setErrorDireccion("La dirección es obligatoria.");
      hayErrores = true;
    }

    // Validar ubicación.
    if (!ubicacion) {
      setErrorDireccion(
        "Buscá la dirección o seleccioná el lugar en el mapa."
      );
      hayErrores = true;
    }

    // Validar descripción.
    const errorDescripcionTexto = validarDescripcion(descripcion);

    if (errorDescripcionTexto) {
      setErrorDescripcion(errorDescripcionTexto);
      hayErrores = true;
    }

    // Validar testigo.
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
        hayErrores = true;
      }
    }

    // Mostrar todos los errores juntos en sus respectivos campos.
    if (hayErrores) {
      return;
    }

    // Validar sesión.
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

    const reporte = {
      id_delito: idDelito,
      direccion: direccion.trim(),
      descripcion,
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

      latitud: Number(ubicacion[0]),
      longitud: Number(ubicacion[1]),
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
      setErrorDireccion("");
      setErrorDelito("");
      setErrorDescripcion("");

      setUbicacion(null);
      setSeleccionManualMapa(false);
      setMostrarMapa(false);

      solicitudDireccion.current++;

      await cargarReportes();

      await Swal.fire({
        icon: "success",
        title: "¡Reporte enviado!",
        text: "Tu reporte fue registrado correctamente.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#2563eb",
        background: "#151e30",
        color: "#ffffff",
      });
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

        <div className="reporte-header">
          <h2>Realizar reporte</h2>
          <p>Completá los datos del hecho ocurrido</p>
        </div>

        <form
          className="reporte-form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* Tipo de delito */}
          <div className="reporte-campo">
            <label htmlFor="id_delito">
              Tipo de delito
            </label>

            <select
              id="id_delito"
              name="id_delito"
              className={`reporte-input-icono ${
                errorDelito ? "error-campo" : ""
              }`}
              value={undefined}
              defaultValue=""
              onChange={() => setErrorDelito("")}
              aria-invalid={Boolean(errorDelito)}
            >
              <option value="">Seleccioná un delito</option>
              <option value="1">Robo</option>
              <option value="2">Hurto</option>
              <option value="3">Asalto</option>
              <option value="4">Vandalismo</option>
              <option value="5">Otro</option>
            </select>

            {errorDelito && (
              <p className="reporte-mensaje reporte-mensaje-error" role="alert">
                <i className="bi bi-exclamation-circle-fill"></i>{" "}
                {errorDelito}
              </p>
            )}
          </div>

          {/* Ubicación */}
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

            <div
              className={`direccion-input ${
                errorDireccion ? "error-campo" : ""
              }`}
            >
              <i className="bi bi-search"></i>

              <input
                type="text"
                id="direccion"
                name="direccion"
                placeholder="Ej: San Martín 450, Tucumán"
                value={direccion}
                onChange={manejarDireccion}
                aria-invalid={Boolean(errorDireccion)}
              />
            </div>

            {errorDireccion && (
              <p className="reporte-mensaje reporte-mensaje-error" role="alert">
                <i className="bi bi-exclamation-circle-fill"></i>{" "}
                {errorDireccion}
              </p>
            )}

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

            <button
              type="button"
              className="btn-ubicacion-actual"
              onClick={usarMiUbicacion}
              disabled={obteniendoUbicacionActual || buscandoDireccion}
            >
              <i className="bi bi-crosshair"></i>

              {obteniendoUbicacionActual
                ? "Obteniendo ubicación..."
                : "Usar mi ubicación actual"}
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

                <div
                  className="mapa-interactivo"
                  style={{
                    width: "100%",
                    height: "300px",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
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

                    {/* Reportes existentes */}
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

                    {/* Ubicación seleccionada */}
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

          {/* Testigos */}
          <div className="reporte-campo">
            <label>¿Hubo testigos?</label>

            <div className="reporte-opciones">

              <label className="reporte-opcion">
                <input
                  type="radio"
                  name="testigos"
                  value="si"
                  checked={testigos === true}
                  onChange={() => {
                    setTestigos(true);
                  }}
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
                />
                No
              </label>

            </div>
          </div>

          {testigos && (
            <div className="reporte-campo">

              <h3>Datos del testigo</h3>

              {/* Nombre */}
              <div className="reporte-campo">
                <label htmlFor="nombre_testigo">Nombre</label>

                <input
                  type="text"
                  id="nombre_testigo"
                  name="nombre_testigo"
                  className={`reporte-input-icono ${
                    erroresTestigo.nombre_testigo ? "error-campo" : ""
                  }`}
                  placeholder="Nombre del testigo"
                  value={datosTestigo.nombre_testigo}
                  onChange={(e) =>
                    manejarNombreTestigo(e, "nombre_testigo")
                  }
                  aria-invalid={Boolean(erroresTestigo.nombre_testigo)}
                />

                {erroresTestigo.nombre_testigo && (
                  <p className="reporte-mensaje reporte-mensaje-error" role="alert">
                    <i className="bi bi-exclamation-circle-fill"></i>{" "}
                    {erroresTestigo.nombre_testigo}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div className="reporte-campo">
                <label htmlFor="apellido_testigo">Apellido</label>

                <input
                  type="text"
                  id="apellido_testigo"
                  name="apellido_testigo"
                  className={`reporte-input-icono ${
                    erroresTestigo.apellido_testigo ? "error-campo" : ""
                  }`}
                  placeholder="Apellido del testigo"
                  value={datosTestigo.apellido_testigo}
                  onChange={(e) =>
                    manejarNombreTestigo(e, "apellido_testigo")
                  }
                  aria-invalid={Boolean(erroresTestigo.apellido_testigo)}
                />

                {erroresTestigo.apellido_testigo && (
                  <p className="reporte-mensaje reporte-mensaje-error" role="alert">
                    <i className="bi bi-exclamation-circle-fill"></i>{" "}
                    {erroresTestigo.apellido_testigo}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div className="reporte-campo">
                <label htmlFor="telefono_testigo">Teléfono</label>

                <input
                  type="tel"
                  id="telefono_testigo"
                  name="telefono_testigo"
                  className={`reporte-input-icono ${
                    erroresTestigo.telefono_testigo ? "error-campo" : ""
                  }`}
                  placeholder="3815551234"
                  value={datosTestigo.telefono_testigo}
                  onChange={manejarTelefonoTestigo}
                  maxLength={10}
                  inputMode="numeric"
                  aria-invalid={Boolean(erroresTestigo.telefono_testigo)}
                />

                {erroresTestigo.telefono_testigo && (
                  <p className="reporte-mensaje reporte-mensaje-error" role="alert">
                    <i className="bi bi-exclamation-circle-fill"></i>{" "}
                    {erroresTestigo.telefono_testigo}
                  </p>
                )}
              </div>

            </div>
          )}

          {/* Descripción */}
          <div className="reporte-campo">
            <label htmlFor="descripcion">
              Descripción del hecho
            </label>

            <textarea
              id="descripcion"
              name="descripcion"
              className={`reporte-input-icono ${
                errorDescripcion ? "error-campo" : ""
              }`}
              placeholder="Contanos qué sucedió..."
              rows="4"
              minLength={MIN_CARACTERES}
              maxLength={MAX_CARACTERES}
              aria-invalid={Boolean(errorDescripcion)}
              onChange={(e) => {
                const error = validarDescripcion(e.target.value);
                setErrorDescripcion(error);
              }}
            />

            <small>
              Mínimo {MIN_CARACTERES} y máximo {MAX_CARACTERES} caracteres.
            </small>

            {errorDescripcion && (
              <p className="reporte-mensaje reporte-mensaje-error" role="alert">
                <i className="bi bi-exclamation-circle-fill"></i>{" "}
                {errorDescripcion}
              </p>
            )}
          </div>

          {/* Estado de la ubicación */}
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

          {/* Mensajes generales */}
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

          {/* Enviar */}
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
