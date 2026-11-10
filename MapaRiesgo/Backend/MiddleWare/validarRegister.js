const { z } = require("zod");

// Letras (con tildes y ñ), separadas por un espacio, guion o apóstrofe. Ej: "María José", "O'Connor", "Pérez-Gómez"
const SOLO_LETRAS = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

const registerSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es demasiado largo (máximo 50)")
    .regex(
      SOLO_LETRAS,
      "El nombre solo puede tener letras, espacios, guiones o apóstrofes",
    ),

  apellido: z
    .string({ error: "El apellido es obligatorio" })
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido es demasiado largo (máximo 50)")
    .regex(
      SOLO_LETRAS,
      "El apellido solo puede tener letras, espacios, guiones o apóstrofes",
    ),

  email: z
    .string({ error: "El email es obligatorio" })
    .trim()
    .toLowerCase()
    .min(1, "El email es obligatorio")
    .max(150, "El email es demasiado largo (máximo 150)")
    .email("Ingresá un email válido, por ejemplo tucorreo@ejemplo.com"),

  // La contraseña NO se hace trim: los espacios no están permitidos y se rechazan.
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(64, "La contraseña es demasiado larga (máximo 64)")
    .regex(/^\S+$/, "La contraseña no puede tener espacios")
    .regex(/[A-Za-z]/, "La contraseña debe tener al menos una letra")
    .regex(/\d/, "La contraseña debe tener al menos un número"),

  telefono: z
    .string({ error: "El teléfono es obligatorio" })
    .trim()
    .min(1, "El teléfono es obligatorio")
    .refine(
      (valor) => /^\+?[\d\s-]+$/.test(valor),
      "El teléfono solo puede tener números, espacios, guiones y un + al inicio",
    )
    .refine((valor) => {
      const cantidad = valor.replace(/\D/g, "").length;
      return cantidad >= 8 && cantidad <= 15;
    }, "El teléfono debe tener entre 8 y 15 dígitos")
    // Se guarda limpio: sin espacios ni guiones
    .transform((valor) => valor.replace(/[\s-]/g, "")),
});

const validarRegister = (req, res, next) => {
  const resultado = registerSchema.safeParse(req.body ?? {});

  if (!resultado.success) {
    // Un solo error por campo (el primero), así no se repiten mensajes
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
      mensaje: "Error al validar el registro",
      errores,
    });
  }

  req.body = resultado.data;
  next();
};

module.exports = validarRegister;
