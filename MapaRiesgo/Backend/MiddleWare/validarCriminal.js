const { z } = require("zod");

// Letras (con tildes y ñ) separadas por un espacio, guion o apóstrofe
const SOLO_LETRAS = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

// Comprueba que la fecha exista de verdad (por ejemplo, rechaza 2020-02-31)
const esFechaReal = (texto) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;

  const [anio, mes, dia] = texto.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
};

const esUrlHttp = (texto) => {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const criminalSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo (máximo 100)")
    .regex(
      SOLO_LETRAS,
      "El nombre solo puede tener letras, espacios, guiones o apóstrofes",
    ),

  apellido: z
    .string({ error: "El apellido es obligatorio" })
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido es demasiado largo (máximo 100)")
    .regex(
      SOLO_LETRAS,
      "El apellido solo puede tener letras, espacios, guiones o apóstrofes",
    ),

  // Los campos opcionales pueden venir vacíos: el controller los guarda como NULL
  descripcion: z
    .string()
    .trim()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .default(""),

  fecha_nacimiento: z
    .string()
    .trim()
    .default("")
    .refine(
      (valor) => valor === "" || esFechaReal(valor),
      "La fecha de nacimiento no es válida (formato AAAA-MM-DD)",
    )
    .refine(
      (valor) => valor === "" || valor >= "1900-01-01",
      "La fecha de nacimiento no puede ser anterior a 1900",
    )
    .refine(
      (valor) => valor === "" || valor <= new Date().toISOString().slice(0, 10),
      "La fecha de nacimiento no puede ser futura",
    ),

  orden_busqueda: z
    .string()
    .trim()
    .max(100, "La orden de búsqueda no puede superar los 100 caracteres")
    .default(""),

  estado: z
    .enum(["Buscado", "Capturado"], {
      error: "El estado debe ser Buscado o Capturado",
    })
    .default("Buscado"),

  foto: z
    .string()
    .trim()
    .default("")
    .refine(
      (valor) => valor === "" || valor.length <= 255,
      "El enlace de la foto es demasiado largo (máximo 255 caracteres)",
    )
    .refine(
      (valor) => valor === "" || esUrlHttp(valor),
      "La foto debe ser un enlace que empiece con http:// o https://",
    ),
});

const validarCriminal = (req, res, next) => {
  const resultado = criminalSchema.safeParse(req.body ?? {});

  if (!resultado.success) {
    // Un solo error por campo (el primero)
    const vistos = new Set();
    const errores = [];

    for (const error of resultado.error.issues) {
      const campo = error.path.join(".");

      if (!vistos.has(campo)) {
        vistos.add(campo);
        errores.push({ campo, mensaje: error.message });
      }
    }

    return res.status(400).json({
      mensaje: "Error al validar los datos del criminal",
      errores,
    });
  }

  req.body = resultado.data;
  next();
};

module.exports = validarCriminal;
