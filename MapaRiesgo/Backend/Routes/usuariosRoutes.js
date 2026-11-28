
const express = require("express");
const router = express.Router();

const {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    cambiarEstadoUsuario,
    modificarUsuario,
    eliminarUsuario
} = require("../Controllers/usuariosController");

router.get("/", obtenerUsuarios);

router.get("/:id", obtenerUsuarioPorId);

router.post("/", crearUsuario);

router.put("/:id", modificarUsuario);

router.patch("/:id/estado", cambiarEstadoUsuario);

router.delete("/:id", eliminarUsuario);

module.exports = router;
