
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import useAuthStore from "../store/Store";
import "../style/Formulario.css";

const API = "http://localhost:3000";
const MIN_CARACTERES = 100;
const CENTRO_TUCUMAN = [-26.8241, -65.2226];

function CentrarMapa({ ubicacion }) {
  const mapa = useMap();

  useEffect(() => {
    if (ubicacion) {
      mapa.setView(ubicacion, 17, { animate: true });
    }
  }, [ubicacion, mapa]);

  return null;
}

function SeleccionarPunto({ finalizarSeleccion }) {
  useMapEvents({
    click: (e) => {
      finalizarSeleccion([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

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

const Formulario = ({
  darValor,
  ubicacion,
  actualizarUbicacion,
}) => {
  const { token, logout } = useAuthStore();

  const [direccion, setDireccion] = useState("");
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);
  const [cargandoGPS, setCargandoGPS] = useState(false);

  const [errorDireccion, setErrorDireccion] = useState(false);
  const [errorDireccionTexto, setErrorDireccionTexto] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [posicionMapa, setPosicionMapa] = useState(null);

  const [errorDelito, setErrorDelito] = useState("");
  const [errorDescripcion, setErrorDescripcion] = useState(false);
  const [errorDescripcionTexto, setErrorDescripcionTexto] = useState("");

  const [testigos, setTestigos] = useState(false);

  const [datosTestigo, setDatosTestigo] = useState({
    nombre_testigo: "",
    apellido_testigo: "",
    telefono_testigo: "",
  });

  const [erroresTestigo, setErroresTestigo] = useState({});

  const coordenadas = (() => {
    if (!ubicacion) return null;

    if (Array.isArray(ubicacion)) {
      return [Number(ubicacion[0]), Number(ubicacion[1])];
    }

    if (ubicacion.lat !== undefined && ubicacion.lng !== undefined) {
      return [Number(ubicacion.lat), Number(ubicacion.lng)];
    }

    return null;
  })();

  const hayUbicacionValida =
    coordenadas &&
    coordenadas.length === 2 &&
    Number.isFinite(coordenadas[0]) &&
    Number.isFinite(coordenadas[1]) &&
    coordenadas[0] >= -90 &&
    coordenadas[0] <= 90 &&
    coordenadas[1] >= -180 &&
    coordenadas[1] <= 180;

  const guardarUbicacion = (lat, lng) => {
    const nuevasCoordenadas = [Number(lat), Number(lng)];

    actualizarUbicacion(nuevasCoordenadas);
    setPosicionMapa(nuevasCoordenadas);

    setErrorDireccion(false);
    setErrorDireccionTexto("");
  };

  const abrirMapa = () => {
    setPosicionMapa(
      hayUbicacionValida ? coordenadas : CENTRO_TUCUMAN
    );

    setMostrarMapa(true);
    setMensaje(
      "Hacé clic sobre el mapa para seleccionar el lugar del incidente."
    );
  };

  const buscarDireccion = async () => {
    if (!direccion.trim()) {
      setErrorDireccion(true);
      setErrorDireccionTexto("Ingresá una dirección para poder buscarla.");
      setMensaje("");
      return;
    }

    setBuscandoDireccion(true);
    setErrorDireccion(false);
    setErrorDireccionTexto("");
    setMensaje("");

    try {
      const consulta = direccion.toLowerCase().includes("tucumán")
        ? direccion.trim()
        : `${direccion.trim()}, Tucumán, Argentina`;

      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=ar&limit=1&q=${encodeURIComponent(
          consulta
        )}`
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo realizar la búsqueda.");
      }

      const resultados = await respuesta.json();

      if (!resultados.length) {
        setErrorDireccion(true);
        setErrorDireccionTexto(
          "No encontramos esa dirección. Revisá lo que escribiste e intentá nuevamente."
        );
        return;
      }

      const resultado = resultados[0];

      guardarUbicacion(resultado.lat, resultado.lon);
      setDireccion(resultado.display_name || direccion);
      setMostrarMapa(true);
      setMensaje("Dirección encontrada correctamente.");
    } catch (error) {
      console.error("Error buscando dirección:", error);

      setErrorDireccion(true);
      setErrorDireccionTexto(
        "No pudimos buscar la dirección. Intentá nuevamente."
      );
    } finally {
      setBuscandoDireccion(false);
    }
  };

  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      setErrorDireccion(true);
      setErrorDireccionTexto(
        "Tu navegador no permite obtener la ubicación actual."
      );
      return;
    }

    setCargandoGPS(true);
    setMensaje("");

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        const lat = posicion.coords.latitude;
        const lng = posicion.coords.longitude;

        guardarUbicacion(lat, lng);
        setMostrarMapa(true);

        try {
          const direccionEncontrada = await obtenerDireccion(lat, lng);

          setDireccion(direccionEncontrada || "Ubicación actual");
          setMensaje("Tu ubicación actual se seleccionó correctamente.");
        } catch (error) {
          console.error("Error obteniendo dirección:", error);

          setDireccion("Ubicación actual");
          setMensaje(
            "Se obtuvo tu ubicación, pero no pudimos encontrar la dirección."
          );
        } finally {
          setCargandoGPS(false);
        }
      },
      (error) => {
        console.error("Error GPS:", error);

        let texto = "No pudimos obtener tu ubicación.";

        if (error.code === 1) {
          texto =
            "Tenés que permitir el acceso a tu ubicación desde el navegador.";
        } else if (error.code === 2) {
          texto = "No se pudo determinar tu ubicación actual.";
        } else if (error.code === 3) {
          texto = "Se agotó el tiempo para obtener tu ubicación.";
        }

        setErrorDireccion(true);
        setErrorDireccionTexto(texto);
        setCargandoGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0,
      }
    );
  };

  const finalizarSeleccion = async (coordenadasSeleccionadas) => {
    const [lat, lng] = coordenadasSeleccionadas;

    guardarUbicacion(lat, lng);

    setDireccion("");
    setErrorDireccion(false);
    setErrorDireccionTexto("");
    setBuscandoDireccion(true);
    setMensaje("Obteniendo dirección del lugar seleccionado...");

    try {
      const direccionEncontrada = await obtenerDireccion(lat, lng);

      if (direccionEncontrada) {
        setDireccion(direccionEncontrada);
        setMensaje("Dirección agregada correctamente.");
      } else {
        setErrorDireccion(true);
        setErrorDireccionTexto(
          "No encontramos una dirección para este punto. Podés ingresarla manualmente."
        );
        setMensaje("");
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);

      setErrorDireccion(true);
      setErrorDireccionTexto(
        "No pudimos obtener la dirección. Podés ingresarla manualmente."
      );
      setMensaje("");
    } finally {
      setBuscandoDireccion(false);
    }
  };

  const manejarTestigos = (e) => {
    const huboTestigos = e.target.value === "si";

    setTestigos(huboTestigos);

    setDatosTestigo({
      nombre_testigo: "",
      apellido_testigo: "",
      telefono_testigo: "",
    });

    setErroresTestigo({});
  };

  const manejarNombreTestigo = (e, campo) => {
    const valor = e.target.value;

    setDatosTestigo((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setErroresTestigo((prev) => ({
      ...prev,
      [campo]: "",
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
      telefono_testigo: "",
    }));
  };

  const validarTestigos = () => {
    const errores = {};

    const regexNombre = /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u;
    const regexTelefono = /^[0-9]{10}$/;

    const nombre = datosTestigo.nombre_testigo.trim();
    const apellido = datosTestigo.apellido_testigo.trim();
    const telefono = datosTestigo.telefono_testigo.trim();

    if (!nombre) {
      errores.nombre_testigo = "Ingresá el nombre del testigo.";
    } else if (nombre.length < 2) {
      errores.nombre_testigo =
        "El nombre debe tener al menos 2 caracteres.";
    } else if (nombre.length > 100) {
      errores.nombre_testigo =
        "El nombre no puede superar los 100 caracteres.";
    } else if (!regexNombre.test(nombre)) {
      errores.nombre_testigo =
        "El nombre contiene caracteres no válidos. Usá solamente letras.";
    }

    if (!apellido) {
      errores.apellido_testigo = "Ingresá el apellido del testigo.";
    } else if (apellido.length < 2) {
      errores.apellido_testigo =
        "El apellido debe tener al menos 2 caracteres.";
    } else if (apellido.length > 100) {
      errores.apellido_testigo =
        "El apellido no puede superar los 100 caracteres.";
    } else if (!regexNombre.test(apellido)) {
      errores.apellido_testigo =
        "El apellido contiene caracteres no válidos. Usá solamente letras.";
    }

    if (!telefono) {
      errores.telefono_testigo = "Ingresá el teléfono del testigo.";
    } else if (!regexTelefono.test(telefono)) {
      errores.telefono_testigo =
        "El teléfono debe tener exactamente 10 números.";
    }

    setErroresTestigo(errores);

    return Object.keys(errores).length === 0;
  };

  const enviarReporte = async (e) => {
    e.preventDefault();

    if (enviando) return;

    setMensaje("");
    setErrorGeneral("");
    setErrorDelito("");
    setErrorDireccion(false);
    setErrorDireccionTexto("");
    setErrorDescripcion(false);
    setErrorDescripcionTexto("");

    const datos = new FormData(e.currentTarget);

    const descripcion = datos.get("descripcion")?.trim() || "";
    const idDelito = Number(datos.get("id_delito"));

    if (!idDelito || ![1, 2, 3, 4, 5, 6].includes(idDelito)) {
      setErrorDelito("Seleccioná un tipo de delito.");
      return;
    }

    if (!direccion.trim()) {
      setErrorDireccion(true);
      setErrorDireccionTexto(
        "Ingresá la dirección del hecho o seleccioná un punto en el mapa."
      );
      return;
    }

    if (!hayUbicacionValida) {
      setErrorDireccion(true);
      setErrorDireccionTexto(
        "Seleccioná la ubicación exacta del incidente en el mapa."
      );
      return;
    }

    if (!descripcion) {
      setErrorDescripcion(true);
      setErrorDescripcionTexto(
        "Contanos qué sucedió. Este campo es obligatorio."
      );
      return;
    }

    if (descripcion.length < MIN_CARACTERES) {
      setErrorDescripcion(true);
      setErrorDescripcionTexto(
        `La descripción es demasiado corta. Escribí al menos ${MIN_CARACTERES} caracteres. Actualmente tiene ${descripcion.length}.`
      );
      return;
    }

    if (descripcion.length > 1000) {
      setErrorDescripcion(true);
      setErrorDescripcionTexto(
        "La descripción no puede superar los 1000 caracteres."
      );
      return;
    }

    if (testigos && !validarTestigos()) {
      return;
    }

    if (!token) {
      logout();

      setErrorGeneral(
        "Tu sesión expiró. Iniciá sesión nuevamente para registrar el reporte."
      );
      return;
    }

    const reporte = {
      descripcion,
      id_delito: idDelito,
      latitud: coordenadas[0],
      longitud: coordenadas[1],
      direccion: direccion.trim(),
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
    };

    setEnviando(true);

    try {
      const respuesta = await fetch(`${API}/api/reportes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reporte),
      });

      const resultado = await respuesta.json();

      if (respuesta.status === 401) {
        logout();

        setErrorGeneral(
          "Tu sesión expiró o no está autorizada. Iniciá sesión nuevamente."
        );

        return;
      }

      if (!respuesta.ok) {
        const detalle = resultado.errores
          ?.map((error) => error.mensaje)
          .join(". ");

        throw new Error(
          detalle ||
            resultado.mensaje ||
            resultado.error ||
            "Ocurrió un error al registrar el reporte."
        );
      }

      await Swal.fire({
        icon: "success",
        title: "¡Reporte registrado!",
        text: "Tu denuncia fue enviada correctamente.",
        confirmButtonText: "Aceptar",
      });

      e.target.reset();

      setDireccion("");
      setErrorDireccion(false);
      setErrorDireccionTexto("");

      setErrorDelito("");
      setErrorDescripcion(false);
      setErrorDescripcionTexto("");

      setMensaje("");
      setErrorGeneral("");

      setTestigos(false);

      setDatosTestigo({
        nombre_testigo: "",
        apellido_testigo: "",
        telefono_testigo: "",
      });

      setErroresTestigo({});
      setMostrarMapa(false);
      setPosicionMapa(null);

      actualizarUbicacion(null);
      darValor(false);
    } catch (error) {
      console.error("Error al enviar reporte:", error);

      setErrorGeneral(
        error.message ||
          "Ocurrió un problema de conexión. Intentá nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal " onClick={() => darValor(false)}>
      <div
        className="form-reporte"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="reporte-card p-59"
          style={{ position: "relative" }}
        >
          <button
            type="button"
            className="reporte-cerrar"
            onClick={() => darValor(false)}
            aria-label="Cerrar formulario"
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <div className="reporte-header">
            <h2>Realizar reporte</h2>
            <p>Completá los datos del hecho ocurrido</p>
          </div>

          <form
            className="reporte-form"
            onSubmit={enviarReporte}
            noValidate
          >
            <div className="reporte-campo">
              <label htmlFor="id_delito">Tipo de delito</label>

              <select
                id="id_delito"
                name="id_delito"
                className={`reporte-input-icono ${
                  errorDelito ? "error-campo" : ""
                }`}
                required
                defaultValue=""
                aria-invalid={!!errorDelito}
                onChange={() => setErrorDelito("")}
              >
                <option value="" disabled>
                  Seleccioná un delito
                </option>
                <option value="1">Robo</option>
                <option value="2">Hurto</option>
                <option value="3">Asalto</option>
                <option value="4">Vandalismo</option>
                <option value="5">Agresión</option>
                <option value="6">Otros</option>
              </select>

              {errorDelito && (
                <p className="reporte-mensaje reporte-mensaje-error">
                  <i className="bi bi-exclamation-circle-fill"></i>{" "}
                  {errorDelito}
                </p>
              )}
            </div>

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
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    setErrorDireccion(false);
                    setErrorDireccionTexto("");
                    setMensaje("");
                  }}
                  placeholder="Ej: Avenida Belgrano 500, Tucumán"
                  aria-invalid={errorDireccion}
                />
              </div>

              {errorDireccion && (
                <p className="reporte-mensaje reporte-mensaje-error">
                  <i className="bi bi-exclamation-circle-fill"></i>{" "}
                  {errorDireccionTexto}
                </p>
              )}

              <button
                type="button"
                className="btn-buscar-direccion"
                onClick={buscarDireccion}
                disabled={buscandoDireccion}
              >
                <i className="bi bi-search"></i>
                {buscandoDireccion ? "Buscando..." : "Buscar dirección"}
              </button>

              <button
                type="button"
                className="btn-ubicacion-actual"
                onClick={obtenerUbicacionActual}
                disabled={cargandoGPS || buscandoDireccion}
              >
                <i className="bi bi-crosshair"></i>
                {cargandoGPS
                  ? "Obteniendo ubicación..."
                  : "Usar mi ubicación actual"}
              </button>

              <div className="ubicacion-separador">
                <span>O también podés</span>
              </div>

              <button
                type="button"
                className="btn-abrir-mapa"
                onClick={abrirMapa}
              >
                <span>
                  <i className="bi bi-map"></i>
                  Seleccionar ubicación en el mapa
                </span>

                <i className="bi bi-chevron-right"></i>
              </button>

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
                      height: "230px",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <MapContainer
                      center={
                        posicionMapa ||
                        coordenadas ||
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

                      <CentrarMapa ubicacion={posicionMapa} />

                      <SeleccionarPunto
                        finalizarSeleccion={finalizarSeleccion}
                      />

                      {posicionMapa && (
                        <CircleMarker
                          center={posicionMapa}
                          radius={9}
                          pathOptions={{
                            color: "white",
                            fillColor: "#2563eb",
                            fillOpacity: 1,
                            weight: 3,
                          }}
                        >
                          <Popup>
                            Ubicación del incidente
                          </Popup>
                        </CircleMarker>
                      )}
                    </MapContainer>
                  </div>

                  <div className="mapa-ayuda">
                    <i className="bi bi-info-circle"></i>
                    <span>
                      Hacé clic en el mapa para seleccionar la ubicación del incidente.
                    </span>
                  </div>
                </div>
              )}

              {hayUbicacionValida && (
                <div className="ubicacion-confirmada">
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Ubicación seleccionada correctamente</span>
                </div>
              )}

              {mensaje && (
                <p className="reporte-mensaje">
                  {mensaje}
                </p>
              )}
            </section>

            <div className="reporte-campo">
              <label>¿Hubo testigos?</label>

              <div className="reporte-opciones">
                <label className="reporte-opcion">
                  <input
                    type="radio"
                    name="testigos"
                    value="si"
                    checked={testigos}
                    onChange={manejarTestigos}
                  />
                  Sí
                </label>

                <label className="reporte-opcion">
                  <input
                    type="radio"
                    name="testigos"
                    value="no"
                    checked={!testigos}
                    onChange={manejarTestigos}
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
                    className={`reporte-input-icono ${
                      erroresTestigo.nombre_testigo ? "error-campo" : ""
                    }`}
                    placeholder="Nombre del testigo"
                    value={datosTestigo.nombre_testigo}
                    onChange={(e) =>
                      manejarNombreTestigo(e, "nombre_testigo")
                    }
                    aria-invalid={!!erroresTestigo.nombre_testigo}
                    required
                  />

                  {erroresTestigo.nombre_testigo && (
                    <p className="reporte-mensaje reporte-mensaje-error">
                      <i className="bi bi-exclamation-circle-fill"></i>{" "}
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
                    className={`reporte-input-icono ${
                      erroresTestigo.apellido_testigo ? "error-campo" : ""
                    }`}
                    placeholder="Apellido del testigo"
                    value={datosTestigo.apellido_testigo}
                    onChange={(e) =>
                      manejarNombreTestigo(e, "apellido_testigo")
                    }
                    aria-invalid={!!erroresTestigo.apellido_testigo}
                    required
                  />

                  {erroresTestigo.apellido_testigo && (
                    <p className="reporte-mensaje reporte-mensaje-error">
                      <i className="bi bi-exclamation-circle-fill"></i>{" "}
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
                    className={`reporte-input-icono ${
                      erroresTestigo.telefono_testigo ? "error-campo" : ""
                    }`}
                    placeholder="3815551234"
                    value={datosTestigo.telefono_testigo}
                    onChange={manejarTelefonoTestigo}
                    maxLength={10}
                    inputMode="numeric"
                    aria-invalid={!!erroresTestigo.telefono_testigo}
                    required
                  />

                  {erroresTestigo.telefono_testigo && (
                    <p className="reporte-mensaje reporte-mensaje-error">
                      <i className="bi bi-exclamation-circle-fill"></i>{" "}
                      {erroresTestigo.telefono_testigo}
                    </p>
                  )}
                </div>
              </div>
            )}

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
                maxLength={1000}
                required
                aria-invalid={errorDescripcion}
                onChange={(e) => {
                  const cantidad = e.target.value.trim().length;

                  if (cantidad >= MIN_CARACTERES) {
                    setErrorDescripcion(false);
                    setErrorDescripcionTexto("");
                  } else if (errorDescripcion) {
                    setErrorDescripcionTexto(
                      `La descripción debe tener al menos ${MIN_CARACTERES} caracteres. Actualmente tiene ${cantidad}.`
                    );
                  }
                }}
              />

              <small>Mínimo {MIN_CARACTERES} caracteres.</small>

              {errorDescripcion && (
                <p className="reporte-mensaje reporte-mensaje-error">
                  <i className="bi bi-exclamation-circle-fill"></i>{" "}
                  {errorDescripcionTexto}
                </p>
              )}
            </div>

            {errorGeneral && (
              <div className="reporte-mensaje reporte-mensaje-error">
                <i className="bi bi-exclamation-circle-fill"></i>{" "}
                {errorGeneral}
              </div>
            )}

            <div className="reporte-acciones">
              <button
                type="submit"
                className="reporte-btn-enviar mb-10"
                disabled={enviando || buscandoDireccion || cargandoGPS}
              >
                {enviando ? (
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
    </div>
  );
};

export default Formulario;
