
const db = require("../Config/db");

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const consulta = `
[out:json][timeout:180];

area["name"="Tucumán"]["boundary"="administrative"]["admin_level"="4"]->.provincia;

(
  nwr["amenity"="police"](area.provincia);
  nwr["police"](area.provincia);
);

out center tags;
`;

function obtenerDireccion(tags) {
  if (tags["addr:full"]) return tags["addr:full"];

  const calle = tags["addr:street"] || "";
  const altura = tags["addr:housenumber"] || "";

  if (calle && altura) return `${calle} ${altura}`;
  if (calle) return calle;

  return tags["addr:place"] || null;
}

function obtenerTipo(tags) {
  if (tags.amenity === "police") return "Comisaría";

  const tipos = {
    barracks: "Cuartel policial",
    checkpoint: "Puesto policial",
    offices: "Oficina policial",
    detention: "Dependencia de detención",
    storage: "Depósito policial",
    training_area: "Centro de entrenamiento",
  };

  return (
    tipos[tags.police] ||
    (tags.police
      ? `Dependencia (${tags.police})`
      : "Dependencia policial")
  );
}

function ejecutarConsulta(sql, valores = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, valores, (error, resultado) => {
      if (error) reject(error);
      else resolve(resultado);
    });
  });
}

// Prueba distintos servidores de Overpass.
async function consultarOverpass() {
  for (const url of OVERPASS_URLS) {
    try {
      console.log(`Probando servidor: ${url}`);

      const respuesta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "DefensaMapaRiesgo/1.0",
        },
        body: `data=${encodeURIComponent(consulta)}`,
        signal: AbortSignal.timeout(200000),
      });

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }

      const datos = await respuesta.json();

      console.log("Consulta recibida correctamente.");

      return datos;
    } catch (error) {
      console.error(`Falló ${url}: ${error.message}`);
    }
  }

  throw new Error(
    "Ningún servidor de Overpass respondió. Intentá nuevamente más tarde."
  );
}

async function importarComisarias() {
  try {
    console.log("================================");
    console.log("IMPORTACIÓN DE DEPENDENCIAS");
    console.log("Provincia de Tucumán");
    console.log("================================");

    console.log("Consultando OpenStreetMap...");

    const datos = await consultarOverpass();

    if (!datos.elements || datos.elements.length === 0) {
      throw new Error(
        "No se encontraron dependencias policiales en Tucumán."
      );
    }

    // Elimina elementos repetidos dentro de la consulta.
    const elementos = new Map();

    datos.elements.forEach((elemento) => {
      elementos.set(`${elemento.type}_${elemento.id}`, elemento);
    });

    console.log(`Elementos encontrados: ${elementos.size}`);

    let insertados = 0;
    let actualizados = 0;
    let sinCoordenadas = 0;

    for (const elemento of elementos.values()) {
      const tags = elemento.tags || {};

      const latitud = elemento.lat ?? elemento.center?.lat;
      const longitud = elemento.lon ?? elemento.center?.lon;

      if (
        !Number.isFinite(latitud) ||
        !Number.isFinite(longitud)
      ) {
        sinCoordenadas++;
        continue;
      }

      const nombre =
        tags.name ||
        tags["name:es"] ||
        tags.operator ||
        "Dependencia policial sin nombre";

      const direccion = obtenerDireccion(tags);

      const localidad =
        tags["addr:city"] ||
        tags["addr:town"] ||
        tags["addr:village"] ||
        tags["addr:municipality"] ||
        tags["addr:suburb"] ||
        null;

      const telefono =
        tags["contact:phone"] ||
        tags.phone ||
        null;

      const tipo = obtenerTipo(tags);

      const sql = `
        INSERT INTO comisaria (
          nombre,
          direccion,
          telefono,
          latitud,
          longitud,
          id_zona,
          osm_id,
          osm_tipo,
          tipo,
          localidad
        )
        VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          direccion = VALUES(direccion),
          telefono = VALUES(telefono),
          latitud = VALUES(latitud),
          longitud = VALUES(longitud),
          tipo = VALUES(tipo),
          localidad = VALUES(localidad)
      `;

      const valores = [
        nombre,
        direccion,
        telefono,
        latitud,
        longitud,
        elemento.id,
        elemento.type,
        tipo,
        localidad,
      ];

      const resultado = await ejecutarConsulta(sql, valores);

      if (resultado.affectedRows === 1) {
        insertados++;
      } else {
        actualizados++;
      }

      console.log(`Procesada: ${nombre}`);
    }

    console.log("\n================================");
    console.log("IMPORTACIÓN FINALIZADA");
    console.log("================================");
    console.log("Nuevos registros:", insertados);
    console.log("Registros existentes procesados:", actualizados);
    console.log("Sin coordenadas:", sinCoordenadas);
    console.log("Total encontrados:", elementos.size);
    console.log("================================");

  } catch (error) {
    console.error("\nERROR AL IMPORTAR DEPENDENCIAS:");
    console.error(error.message);

  } finally {
    if (typeof db.end === "function") {
      db.end();
    }
  }
}

importarComisarias();
