
const express = require("express");
const router = express.Router();

const {
    agregarContacto,
    obtenerContactos
} = require("../Controllers/contactoEmergenciaController");

router.post("/", agregarContacto);

router.get("/:id_usuario", obtenerContactos);

module.exports = router;
