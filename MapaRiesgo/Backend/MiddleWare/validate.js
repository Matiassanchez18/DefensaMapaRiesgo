
const { z } = require("zod");

const reporteSchema = z.object({
  id_delito: z.coerce
    .number()
    .int("El ID del delito debe ser un número entero")
    .positive("Seleccioná un tipo de delito"),

  direccion: z.string()
    .trim()
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(255, "La dirección es demasiado larga"),

  descripcion: z.string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción es demasiado larga"),

  testigos: z.boolean({
    error: "Indicá si hubo testigos",
  }),
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
