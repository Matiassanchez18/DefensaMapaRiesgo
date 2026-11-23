// Carga 50 criminales FICTICIOS de prueba en la tabla criminales_buscados.
//   Desde la carpeta Backend:   node Scripts/cargarCriminales.js
// Si la tabla ya tiene datos no hace nada. Para borrar todo y cargar los 50 de nuevo:
//   node Scripts/cargarCriminales.js --forzar
//
// Los datos se generan combinando listas con cuentas simples (sin azar),
// así todos los integrantes del grupo obtienen exactamente los mismos 50.

const { fotoPorDefecto } = require("../Utils/avatar");

const NOMBRES = [
  "Juan",
  "Carlos",
  "Luis",
  "Miguel",
  "Jorge",
  "Héctor",
  "Raúl",
  "Diego",
  "Martín",
  "Gustavo",
  "Sergio",
  "Fabián",
  "Marcelo",
  "Ramón",
  "Óscar",
  "María",
  "Laura",
  "Silvia",
  "Claudia",
  "Natalia",
  "Romina",
  "Paola",
  "Gabriela",
  "Verónica",
  "Lucía",
];

const APELLIDOS = [
  "Gómez",
  "Rodríguez",
  "Fernández",
  "López",
  "Martínez",
  "Pérez",
  "Sánchez",
  "Romero",
  "Díaz",
  "Álvarez",
  "Torres",
  "Ruiz",
  "Ramírez",
  "Flores",
  "Acosta",
  "Benítez",
  "Medina",
  "Herrera",
  "Aguirre",
  "Castro",
  "Ortiz",
  "Rojas",
  "Silva",
  "Molina",
  "Suárez",
  "Giménez",
  "Vega",
  "Ríos",
  "Paz",
  "Luna",
];

const ALIAS = [
  "Pantera",
  "Tigre",
  "Fantasma",
  "Sombra",
  "Halcón",
  "Víbora",
  "Cuervo",
  "Lobo",
  "Zorro",
  "Búho",
  "Camaleón",
  "Escorpión",
];

const DELITOS = [
  "robo agravado",
  "homicidio simple",
  "estafa reiterada",
  "tráfico de estupefacientes",
  "robo de automotores",
  "abigeato",
  "secuestro extorsivo",
  "falsificación de documentos",
  "lesiones graves",
  "violación de domicilio",
  "extorsión",
  "robo a mano armada",
];

const LUGARES = [
  "San Miguel de Tucumán",
  "Yerba Buena",
  "Tafí Viejo",
  "Banda del Río Salí",
  "Concepción",
  "Monteros",
  "Aguilares",
  "Famaillá",
  "Lules",
  "Alderetes",
];

const RASGOS = [
  "Contextura robusta y cabello corto",
  "Contextura delgada, usa barba",
  "Tatuaje en el antebrazo derecho",
  "Cicatriz en la ceja izquierda",
  "Estatura alta y cabello oscuro",
  "Usa anteojos",
  "Cabello canoso",
  "Tatuaje en el cuello",
  "Estatura baja y contextura media",
  "Lleva el cabello teñido",
];

const JUZGADOS = [
  "Juzgado Federal N.° 1",
  "Juzgado de Instrucción Penal I",
  "Juzgado Penal N.° 2",
  "Fiscalía de Instrucción III",
  "Juzgado Federal N.° 2",
];

const dosDigitos = (numero) => String(numero).padStart(2, "0");

const generarCriminales = () => {
  const criminales = [];

  for (let i = 0; i < 50; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const apellido = APELLIDOS[(i * 7 + 3) % APELLIDOS.length];
    const alias = ALIAS[(i * 5 + 1) % ALIAS.length];
    const delito = DELITOS[(i * 7) % DELITOS.length];
    const lugar = LUGARES[(i * 3 + 1) % LUGARES.length];
    const rasgo = RASGOS[(i * 9 + 4) % RASGOS.length];
    const juzgado = JUZGADOS[i % JUZGADOS.length];

    // 1 de cada 5 ya fue capturado
    const capturado = i % 5 === 4;

    const anio = 1960 + ((i * 7) % 45);
    const mes = 1 + ((i * 5) % 12);
    const dia = 1 + ((i * 11) % 28);

    criminales.push({
      nombre,
      apellido,
      descripcion: capturado
        ? `Alias «${alias}». Fue buscado por ${delito}. ${rasgo}. Capturado en ${lugar}.`
        : `Alias «${alias}». Buscado por ${delito}. ${rasgo}. Última vez visto en ${lugar}.`,
      fecha_nacimiento: `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`,
      orden_busqueda: `Orden de captura N.° 2026-${String(i + 1).padStart(3, "0")} · ${juzgado}`,
      estado: capturado ? "Capturado" : "Buscado",
      foto: fotoPorDefecto(nombre, apellido),
    });
  }

  return criminales;
};

const cargarCriminales = async () => {
  // Se conecta a la base recién acá, así el archivo se puede importar sin abrir conexiones
  const db = require("../Config/db").promise();
  const forzar = process.argv.includes("--forzar");

  try {
    const [filas] = await db.query(
      "SELECT COUNT(*) AS total FROM criminales_buscados",
    );
    const total = filas[0].total;

    if (total > 0 && !forzar) {
      console.log(`La tabla ya tiene ${total} criminal(es), no se cargó nada.`);
      console.log(
        "Para borrarlos y cargar los 50 de nuevo: node Scripts/cargarCriminales.js --forzar",
      );
      return;
    }

    if (forzar) {
      await db.query("TRUNCATE TABLE criminales_buscados");
    }

    const valores = generarCriminales().map((c) => [
      c.nombre,
      c.apellido,
      c.descripcion,
      c.fecha_nacimiento,
      c.orden_busqueda,
      c.estado,
      c.foto,
    ]);

    await db.query(
      `INSERT INTO criminales_buscados
         (nombre, apellido, descripcion, fecha_nacimiento, orden_busqueda, estado, foto)
       VALUES ?`,
      [valores],
    );

    console.log(`Listo: se cargaron ${valores.length} criminales de prueba.`);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    process.exit(0);
  }
};

if (require.main === module) {
  cargarCriminales();
}

module.exports = { generarCriminales };
