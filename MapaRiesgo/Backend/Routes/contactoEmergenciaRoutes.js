
const express = require("express");
const router = express.Router();

const {
    agregarContacto,
    obtenerContactos,
    actualizarContacto,
    eliminarContacto
} = require("../Controllers/contactoEmergenciaController");

router.post("/", agregarContacto);

router.get("/:id_usuario", obtenerContactos);

router.put("/:id_contacto", actualizarContacto);

router.delete("/:id_contacto", eliminarContacto);

module.exports = router;
