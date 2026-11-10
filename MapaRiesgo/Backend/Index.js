const express = require("express");
const cors = require("cors");
const registerRoutes = require("./Routes/registerRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/register", registerRoutes);

const reporteRoutes = require("./Routes/reporteRoutes");
const comisariaRoutes = require("./Routes/comisariaRoutes");

app.use("/api/reportes", reporteRoutes);
app.use("/api/comisarias", comisariaRoutes);

app.listen(3000, () => {
  console.log("Servidor funcionando en el puerto 3000");
});
