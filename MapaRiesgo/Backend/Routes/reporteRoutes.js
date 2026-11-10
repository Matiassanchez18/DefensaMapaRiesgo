
const express = require("express");
const router = express.Router();

const {
  agregarReporte,
  obtenerReportes,
  obtenerUltimoReporte,
} = require("../Controllers/reporteController");

const validarReporte = require("../MiddleWare/ValidarReporte");

router.post("/", validarReporte, agregarReporte);

router.get("/", obtenerReportes);

router.get("/ultimo", obtenerUltimoReporte)

module.exports = router;
