
const express = require("express");
const router = express.Router();

const validarReporte = require("../middlewares/validarReporte");

router.post("/", validarReporte, (req, res) => {
  res.json({
    mensaje: "Reporte validado correctamente",
    datos: req.body,
  });
});

module.exports = router;
