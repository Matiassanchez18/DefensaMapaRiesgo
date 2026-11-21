const { z } = require("zod");

const nombreSchema = z
  .string()
  .trim()
  .min(2, "Debe tener al menos 2 caracteres")
  .max(100, "No puede superar los 100 caracteres")
  .regex(
    /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u,
    "Solo se permiten letras, espacios y guiones"
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

const reporteSchema = z.object({
  id_usuario: z.coerce
    .number()
    .int("El ID del usuario debe ser un número entero")
    .positive("El ID del usuario no es válido"),

  id_delito: z.coerce
    .number()
    .int("El ID del delito debe ser un número entero")
    .positive("Seleccioná un tipo de delito"),

  direccion: z
    .string()
    .trim()
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(255, "La dirección es demasiado larga"),

  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción es demasiado larga"),

  testigos: z.boolean({
    error: "Indicá si hubo testigos",
  }),

  nombre_testigo: nombreSchema.nullable().optional(),

  apellido_testigo: nombreSchema.nullable().optional(),

  telefono_testigo: z
    .union([telefonoSchema, z.literal("")])
    .nullable()
    .optional(),

  latitud: z.coerce.number().min(-90).max(90),

  longitud: z.coerce.number().min(-180).max(180),
}).superRefine((datos, ctx) => {
  if (datos.testigos) {
    if (!datos.nombre_testigo) {
      ctx.addIssue({
        code: "custom",
        path: ["nombre_testigo"],
        message: "El nombre del testigo es obligatorio",
      });
    }

    if (!datos.apellido_testigo) {
      ctx.addIssue({
        code: "custom",
        path: ["apellido_testigo"],
        message: "El apellido del testigo es obligatorio",
      });
    }
  }
});

const validarReporte = (req, res, next) => {
  const resultado = reporteSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({
      mensaje: "Error al validar el reporte",
      errores: resultado.error.issues.map((error) => ({
        campo: error.path.join("."),
        mensaje: error.message,
      })),
    });
  }

  req.body = resultado.data;
  next();
};

module.exports = validarReporte;