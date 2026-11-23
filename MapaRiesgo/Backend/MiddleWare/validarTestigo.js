const { z } = require("zod");

const etiquetas = {
  nombre: "Nombre",
  apellido: "Apellido",
  telefono: "Teléfono",
  id_reporte: "ID del reporte",
};

const nombreSchema = (campo) =>
  z
    .string({ error: `${campo} es obligatorio` })
    .trim()
    .min(2, "Debe tener al menos 2 caracteres")
    .max(100, "No puede superar los 100 caracteres")
    .regex(
      /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u,
      "Solo se permiten letras, espacios y guiones",
    );

const telefonoSchema = z
  .string()
  .trim()
  .refine((telefono) => {
    const numero = telefono.replace(/[\s()+.-]/g, "");

    return (
      /^\d{10}$/.test(numero) ||
      /^54\d{10}$/.test(numero) ||
      /^549\d{10}$/.test(numero)
    );
  }, "Ingresá un teléfono argentino válido");

const testigoSchema = z.object({
  nombre: nombreSchema("El nombre"),

  apellido: nombreSchema("El apellido"),

  // El teléfono es opcional: puede faltar, venir null o vacío
  telefono: z
    .union([telefonoSchema, z.literal("")])
    .nullable()
    .optional(),

  id_reporte: z.coerce
    .number({ error: "Indicá el ID del reporte" })
    .int("Debe ser un número entero")
    .positive("No es válido"),
});

const validarTestigo = (req, res, next) => {
  const resultado = testigoSchema.safeParse(req.body ?? {});

  if (!resultado.success) {
    const errores = resultado.error.issues.map((error) => ({
      campo: error.path.join("."),
      mensaje: error.message,
    }));

    // Un solo mensaje por campo (el primero), para que el texto no se repita
    const primeroPorCampo = errores.filter(
      (error, i) => errores.findIndex((e) => e.campo === error.campo) === i,
    );

    return res.status(400).json({
      // El frontend muestra este texto tal cual
      mensaje: primeroPorCampo
        .map((e) => `${etiquetas[e.campo] || e.campo}: ${e.mensaje}`)
        .join(" | "),
      errores,
    });
  }

  req.body = resultado.data;
  next();
};

module.exports = validarTestigo;