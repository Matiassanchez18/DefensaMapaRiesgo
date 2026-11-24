// Se corre UNA sola vez: encripta con bcrypt las contraseñas que todavía están en texto plano.
//   Desde la carpeta Backend:  node Scripts/hashearContrasenas.js
// Si lo corrés de nuevo no pasa nada: salta las que ya están encriptadas.

const bcrypt = require("bcrypt");
const db = require("../Config/db").promise();

// Un hash de bcrypt siempre empieza con $2a$, $2b$ o $2y$ y mide 60 caracteres
const yaEncriptada = (texto) => /^\$2[aby]\$\d{2}\$.{53}$/.test(texto);

const encriptarContrasenas = async () => {
  try {
    const [usuarios] = await db.query(
      "SELECT id_usuario, email, `contraseña` AS password FROM usuario",
    );

    let actualizadas = 0;

    for (const usuario of usuarios) {
      if (!usuario.password || yaEncriptada(usuario.password)) {
        continue;
      }

      const hash = await bcrypt.hash(usuario.password, 10);

      await db.query(
        "UPDATE usuario SET `contraseña` = ? WHERE id_usuario = ?",
        [hash, usuario.id_usuario],
      );

      actualizadas++;
      console.log(`Encriptada: ${usuario.email}`);
    }

    console.log(
      `Listo: ${actualizadas} contraseña(s) encriptada(s), ${usuarios.length - actualizadas} ya estaban listas.`,
    );
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    process.exit(0);
  }
};

encriptarContrasenas();
