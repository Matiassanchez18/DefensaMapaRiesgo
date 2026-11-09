const express = require("express");
const router = express.Router();

const {
  obtenerComisarias,
} = require("../Controllers/comisariaController");

router.get("/", obtenerComisarias);

module.exports = router;