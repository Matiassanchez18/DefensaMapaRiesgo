const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const reporteRoutes = require("./Routes/reporteRoutes");

app.use("/api/reportes", reporteRoutes);

app.listen(3000, () => {
  console.log("Servidor funcionando en el puerto 3000");
});