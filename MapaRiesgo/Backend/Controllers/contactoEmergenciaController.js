
const db = require("../Config/db.js");

const agregarContacto = (req, res) => {
    const { id_usuario, nombre, telefono, relacion } = req.body;

    if (!id_usuario || !nombre || !telefono || !relacion) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios."
        });
    }

    if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0) {
        return res.status(400).json({
            mensaje: "El ID del usuario no es válido."
        });
    }

    const sqlUsuario = `
        SELECT id_usuario
        FROM usuario
        WHERE id_usuario = ?
    `;

    db.query(sqlUsuario, [id_usuario], (error, resultados) => {
        if (error) {
            console.error("Error al verificar usuario:", error);

            return res.status(500).json({
                mensaje: "Error al verificar el usuario."
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "El usuario no existe."
            });
        }

        const sqlContacto = `
            INSERT INTO contacto_emergencia
            (id_usuario, nombre, telefono, relacion)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sqlContacto,
            [
                Number(id_usuario),
                nombre.trim(),
                telefono.trim(),
                relacion.trim()
            ],
            (error, resultado) => {
                if (error) {
                    console.error("Error SQL al guardar contacto:", error);

                    return res.status(500).json({
                        mensaje: "Error al guardar el contacto."
                    });
                }

                res.status(201).json({
                    mensaje: "Contacto guardado exitosamente.",
                    id_contacto: resultado.insertId
                });
            }
        );
    });
};


const obtenerContactos = (req, res) => {
    const { id_usuario } = req.params;

    if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0) {
        return res.status(400).json({
            mensaje: "El ID del usuario no es válido."
        });
    }

    const sql = `
        SELECT
            id_contacto,
            id_usuario,
            nombre,
            telefono,
            relacion
        FROM contacto_emergencia
        WHERE id_usuario = ?
        ORDER BY id_contacto DESC
    `;

    db.query(sql, [id_usuario], (error, resultados) => {
        if (error) {
            console.error("Error al obtener contactos:", error);

            return res.status(500).json({
                mensaje: "Error al obtener los contactos."
            });
        }

        res.status(200).json(resultados);
    });
};


module.exports = {
    agregarContacto,
    obtenerContactos
};
