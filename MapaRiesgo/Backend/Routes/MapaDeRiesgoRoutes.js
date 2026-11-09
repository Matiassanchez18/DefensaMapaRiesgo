
const express = require("express");
const router = express.Router();

const {
  obtenerDelitos,
  agregarDelito,
} = require("../controllers/delitoController");

router.get("/", obtenerDelitos);
router.post("/", agregarDelito);

module.exports = router;
