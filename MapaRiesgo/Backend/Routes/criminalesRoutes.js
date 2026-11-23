const express = require("express");
const router = express.Router();

const {
  obtenerCriminales,
  crearCriminal,
  modificarCriminal,
  eliminarCriminal,
} = require("../Controllers/criminalesController");
const validarCriminal = require("../MiddleWare/validarCriminal");

router.get("/", obtenerCriminales);
router.post("/", validarCriminal, crearCriminal);
router.put("/:id", validarCriminal, modificarCriminal);
router.delete("/:id", eliminarCriminal);

module.exports = router;
