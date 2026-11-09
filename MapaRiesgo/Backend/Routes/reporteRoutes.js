
const express = require("express");
const router = express.Router();

const {
  agregarReporte,
  obtenerReportes,
} = require("../Controllers/reporteController");

const validarReporte = require("../MiddleWare/ValidarReporte");

router.post("/", validarReporte, agregarReporte);

router.get("/", obtenerReportes);

module.exports = router;
