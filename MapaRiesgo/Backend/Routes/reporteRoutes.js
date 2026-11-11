
const express = require("express");
const router = express.Router();

const { obtenerDashboard } = require("../Controllers/adminController");

const {
  agregarReporte,
  obtenerReportes,
  obtenerUltimoReporte,
  actualizarReporte,
  eliminarReporte
} = require("../Controllers/reporteController");

const validarReporte = require("../MiddleWare/ValidarReporte");

router.post("/", validarReporte, agregarReporte);

router.get("/", obtenerReportes);
router.get("/ultimo", obtenerUltimoReporte);
router.get("/dashboard", obtenerDashboard);


router.put("/:id", actualizarReporte);
router.delete("/:id", eliminarReporte);

module.exports = router;
