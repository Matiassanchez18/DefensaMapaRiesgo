const { scrypt, randomBytes, timingSafeEqual } = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(scrypt);
const LARGO_CLAVE = 64;

// Devuelve "salt:hash" (los dos en hexadecimal). Nunca se guarda la contraseña real.
const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, LARGO_CLAVE);
  return `${salt}:${hash.toString("hex")}`;
};

// Para el login: compara la contraseña escrita con el "salt:hash" guardado en la BD.
const verificarPassword = async (password, guardado) => {
  const [salt, hash] = String(guardado).split(":");

  if (!salt || !hash) {
    return false;
  }

  const hashGuardado = Buffer.from(hash, "hex");
  const hashNuevo = await scryptAsync(password, salt, hashGuardado.length);

  return timingSafeEqual(hashGuardado, hashNuevo);
};

module.exports = { hashPassword, verificarPassword };
