
const express = require("express");
const router = express.Router();

const { obtenerDashboard } = require("../Controllers/adminController");

router.get("/dashboard", obtenerDashboard);

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
