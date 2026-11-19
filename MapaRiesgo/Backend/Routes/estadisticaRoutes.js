const express = require("express");
const router = express.Router();

const {
  obtenerEstadisticas,
} = require("../Controllers/estadisticasControllers");

router.get("/", obtenerEstadisticas);

module.exports = router;