
const db = require("../Config/db.js");

// AGREGAR CONTACTO
const agregarContacto = (req, res) => {
    const { id_usuario, nombre, telefono, relacion } = req.body;

    if (!id_usuario || !nombre?.trim() || !telefono?.trim() || !relacion?.trim()) {
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


// OBTENER CONTACTOS
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


// MODIFICAR CONTACTO
const actualizarContacto = (req, res) => {
    const { id_contacto } = req.params;
    const { id_usuario, nombre, telefono, relacion } = req.body;

    if (
        !Number.isInteger(Number(id_contacto)) ||
        Number(id_contacto) <= 0 ||
        !Number.isInteger(Number(id_usuario)) ||
        Number(id_usuario) <= 0
    ) {
        return res.status(400).json({
            mensaje: "Los identificadores no son válidos."
        });
    }

    if (!nombre?.trim() || !telefono?.trim() || !relacion?.trim()) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios."
        });
    }

    // Comprobamos que el contacto pertenezca al usuario
    const sqlVerificar = `
        SELECT id_contacto
        FROM contacto_emergencia
        WHERE id_contacto = ? AND id_usuario = ?
    `;

    db.query(
        sqlVerificar,
        [id_contacto, id_usuario],
        (error, resultados) => {
            if (error) {
                console.error("Error al verificar contacto:", error);
                return res.status(500).json({
                    mensaje: "Error al verificar el contacto."
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: "No se encontró el contacto."
                });
            }

            const sqlActualizar = `
                UPDATE contacto_emergencia
                SET nombre = ?, telefono = ?, relacion = ?
                WHERE id_contacto = ? AND id_usuario = ?
            `;

            db.query(
                sqlActualizar,
                [
                    nombre.trim(),
                    telefono.trim(),
                    relacion.trim(),
                    id_contacto,
                    id_usuario
                ],
                (error) => {
                    if (error) {
                        console.error("Error al actualizar contacto:", error);
                        return res.status(500).json({
                            mensaje: "Error al modificar el contacto."
                        });
                    }

                    res.status(200).json({
                        mensaje: "Contacto modificado exitosamente."
                    });
                }
            );
        }
    );
};


// ELIMINAR CONTACTO
const eliminarContacto = (req, res) => {
    const { id_contacto } = req.params;
    const { id_usuario } = req.body;

    if (
        !Number.isInteger(Number(id_contacto)) ||
        Number(id_contacto) <= 0 ||
        !Number.isInteger(Number(id_usuario)) ||
        Number(id_usuario) <= 0
    ) {
        return res.status(400).json({
            mensaje: "Los identificadores no son válidos."
        });
    }

    const sql = `
        DELETE FROM contacto_emergencia
        WHERE id_contacto = ? AND id_usuario = ?
    `;

    db.query(
        sql,
        [id_contacto, id_usuario],
        (error, resultado) => {
            if (error) {
                console.error("Error al eliminar contacto:", error);
                return res.status(500).json({
                    mensaje: "Error al eliminar el contacto."
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "No se encontró el contacto."
                });
            }

            res.status(200).json({
                mensaje: "Contacto eliminado exitosamente."
            });
        }
    );
};


module.exports = {
    agregarContacto,
    obtenerContactos,
    actualizarContacto,
    eliminarContacto
};
