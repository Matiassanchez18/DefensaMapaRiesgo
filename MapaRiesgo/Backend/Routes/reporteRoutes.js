
const express = require("express");
const router = express.Router();

const {
    agregarReporte,
    obtenerReportes,
    obtenerUltimoReporte,
    actualizarReporte,
    eliminarReporte,
} = require("../Controllers/reporteController");

const validarReporte = require("../MiddleWare/validarReporte");

router.post("/", validarReporte, agregarReporte);

router.get("/", obtenerReportes);
router.get("/ultimo", obtenerUltimoReporte);

router.put("/:id", actualizarReporte);
router.delete("/:id", eliminarReporte);

module.exports = router;
