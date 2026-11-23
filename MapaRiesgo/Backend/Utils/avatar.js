// Arma la URL de una foto de perfil ilustrada usando la API pública DiceBear.
// La misma "semilla" (nombre + apellido) siempre genera la misma imagen,
// así cada criminal conserva su foto aunque se vuelva a pedir.
const fotoPorDefecto = (nombre, apellido) => {
  const semilla = encodeURIComponent(`${nombre} ${apellido}`.trim());

  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${semilla}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

module.exports = { fotoPorDefecto };
