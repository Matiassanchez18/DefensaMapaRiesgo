const validarLogin = (req, res, next) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({
      mensaje: "El correo y la contraseña son obligatorios.",
    });
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailValido) {
    return res.status(400).json({
      mensaje: "El correo no tiene un formato válido.",
    });
  }

  next();
};

module.exports = validarLogin;