const path = require("path");
const jwt = require("jsonwebtoken");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
  quiet: true,
});

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error(
    "Falta JWT_SECRET. Creá el archivo Backend/.env con esta línea: JWT_SECRET=una_clave_larga_y_secreta",
  );
}

const DURACION = "1d";

const generarToken = (datos) => {
  return jwt.sign(datos, SECRET, { expiresIn: DURACION });
};

const verificarToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};

module.exports = { generarToken, verificarToken };
