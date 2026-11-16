const express = require("express");
const router = express.Router();

const { iniciarSesion } = require("../Controllers/loginController");

router.post("/", iniciarSesion);
module.exports = router;