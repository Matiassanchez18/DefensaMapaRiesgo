const express = require("express");
const cors = require("cors");

require("dotenv").config();

const testigoRoutes=require("./Routes/testigoRoutes")
const registerRoutes = require("./Routes/registerRoutes");
const reporteRoutes = require("./Routes/reporteRoutes");
const comisariaRoutes = require("./Routes/comisariaRoutes");
const usuariosRoutes = require("./Routes/usuariosRoutes");
const loginRoutes = require("./Routes/loginRoutes");
const contactoEmergenciaRoutes = require("./Routes/contactoEmergenciaRoutes");
const estadisticaRoutes = require("./Routes/estadisticaRoutes");
const criminalesRoutes = require("./Routes/criminalesRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/comisarias", comisariaRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/contactos-emergencia", contactoEmergenciaRoutes);
app.use("/api/estadisticas", estadisticaRoutes);
app.use("/api/criminales", criminalesRoutes);
app.use("/api/testigos",testigoRoutes)

app.listen(3000, () => {
  console.log("Servidor funcionando en el puerto 3000");
});
