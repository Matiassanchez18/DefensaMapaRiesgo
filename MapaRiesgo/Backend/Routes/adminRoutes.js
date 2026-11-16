
const express = require("express");
const router = express.Router();

const { obtenerDashboard } = require("../Controllers/adminController");

const verificarToken = require("../MiddleWare/authMiddleware");
const adminMiddleware = require("../MiddleWare/adminMiddleWare");

router.get(
    "/dashboard",
    verificarToken,
    adminMiddleware,
    obtenerDashboard
);

module.exports = router;
