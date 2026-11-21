const express = require("express");
const router = express.Router();

const { iniciarSesion } = require("../Controllers/loginController");
const validarLogin = require("../MiddleWare/validarLogin");

router.post("/", validarLogin, iniciarSesion);

module.exports = router;