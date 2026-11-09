const express = require("express");
const router = express.Router();

const { agregarReporte } = require("../Controllers/reporteController");

const validarReporte = require("../MiddleWare/ValidarReporte");

router.post("/", validarReporte, agregarReporte);

module.exports = router;
