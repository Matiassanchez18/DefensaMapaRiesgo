const express = require("express");
const router = express.Router();

const { registrarUsuario } = require("../Controllers/registerController");
const validarRegister = require("../MiddleWare/validarRegister");

router.post("/", validarRegister, registrarUsuario);

module.exports = router;
