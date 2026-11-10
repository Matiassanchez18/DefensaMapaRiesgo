
const db = require("../config/db");
const bcrypt = require("bcryptjs");


const obtenerUsuarios = (req, res) => {
    const sql = `
        SELECT id_usuario, nombre, apellido, email,
               telefono, fecha_registro
        FROM usuario
        ORDER BY id_usuario DESC
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al obtener los usuarios",
                error: error.message
            });
        }

        res.json(resultados);
    });
};

const obtenerUsuarioPorId = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT id_usuario, nombre, apellido, email,
               telefono, fecha_registro
        FROM usuario
        WHERE id_usuario = ?
    `;

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al buscar el usuario"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json(resultados[0]);
    });
};

const crearUsuario = async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            email,
            contraseña,
            telefono
        } = req.body;

        if (!nombre || !apellido || !email || !contraseña) {
            return res.status(400).json({
                mensaje: "Nombre, apellido, email y contraseña son obligatorios"
            });
        }

        const contraseñaHash = await bcrypt.hash(contraseña, 10);

        const sql = `
            INSERT INTO usuario
            (nombre, apellido, email, contraseña, telefono, fecha_registro)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        db.query(
            sql,
            [nombre, apellido, email, contraseñaHash, telefono || null],
            (error, resultado) => {
                if (error) {
                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            mensaje: "El email ya está registrado"
                        });
                    }

                    return res.status(500).json({
                        mensaje: "Error al crear el usuario",
                        error: error.message
                    });
                }

                res.status(201).json({
                    mensaje: "Usuario creado correctamente",
                    id_usuario: resultado.insertId
                });
            }
        );

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al procesar la contraseña"
        });
    }
};

const modificarUsuario = (req, res) => {
    const { id } = req.params;

    const {
        nombre,
        apellido,
        email,
        telefono
    } = req.body;

    if (!nombre || !apellido || !email) {
        return res.status(400).json({
            mensaje: "Nombre, apellido y email son obligatorios"
        });
    }

    const sql = `
        UPDATE usuario
        SET nombre = ?,
            apellido = ?,
            email = ?,
            telefono = ?
        WHERE id_usuario = ?
    `;

    db.query(
        sql,
        [nombre, apellido, email, telefono || null, id],
        (error, resultado) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "El email ya pertenece a otro usuario"
                    });
                }

                return res.status(500).json({
                    mensaje: "Error al modificar el usuario",
                    error: error.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado"
                });
            }

            res.json({
                mensaje: "Usuario modificado correctamente"
            });
        }
    );
};

const eliminarUsuario = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM usuario
        WHERE id_usuario = ?
    `;

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            return res.status(500).json({
                mensaje: "Error al eliminar el usuario",
                error: error.message
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json({
            mensaje: "Usuario eliminado correctamente"
        });
    });
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    modificarUsuario,
    eliminarUsuario
};
