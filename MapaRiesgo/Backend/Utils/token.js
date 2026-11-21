const path = require("path");
const jwt = require("jsonwebtoken");

// Lee el archivo Backend/.env (JWT_SECRET) sin importar desde qué carpeta se inicie el servidor
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

const DURACION = "1d"; // el token vence al día

// Crea un token firmado con los datos del usuario
const generarToken = (datos) => {
  return jwt.sign(datos, SECRET, { expiresIn: DURACION });
};

// Devuelve los datos del token si es válido y no venció; si no, devuelve null
const verificarToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};

module.exports = { generarToken, verificarToken };
