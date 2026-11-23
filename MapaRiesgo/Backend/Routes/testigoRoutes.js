const express = require("express");
const router = express.Router();

const {
  obtenerTestigos,
  obtenerTestigo,
  crearTestigo,
  actualizarTestigo,
  eliminarTestigo,
} = require("../Controllers/testigoController");

const validarTestigo = require("../MiddleWare/validarTestigo");
const verificarToken = require("../MiddleWare/authToken");
const soloAdmin = require("../MiddleWare/soloAdmin");

// Los datos de los testigos son personales: solo un administrador con sesión iniciada
router.use(verificarToken, soloAdmin);

router.get("/", obtenerTestigos);
router.get("/:id", obtenerTestigo);
router.post("/", validarTestigo, crearTestigo);
router.put("/:id", validarTestigo, actualizarTestigo);
router.delete("/:id", eliminarTestigo);

module.exports = router;