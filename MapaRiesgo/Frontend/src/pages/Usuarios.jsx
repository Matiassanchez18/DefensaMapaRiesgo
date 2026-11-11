
import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/usuarios";

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [editando, setEditando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // GET: Obtener usuarios desde el backend
    const obtenerUsuarios = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await fetch(API_URL);

            if (!respuesta.ok) {
                throw new Error("Error al obtener usuarios");
            }

            const datos = await respuesta.json();
            setUsuarios(datos);

        } catch (error) {
            console.error("Error:", error);
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    // DELETE: Eliminar usuario
    const eliminar = async (id) => {
        if (!window.confirm("¿Seguro que querés eliminar este usuario?")) {
            return;
        }

        try {
            const respuesta = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.mensaje || "Error al eliminar usuario");
            }

            setUsuarios((anteriores) =>
                anteriores.filter((usuario) => usuario.id_usuario !== id)
            );

            alert("Usuario eliminado correctamente");

        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    // PUT: Modificar usuario
    const guardar = async (e) => {
        e.preventDefault();

        try {
            const respuesta = await fetch(
                `${API_URL}/${editando.id_usuario}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nombre: editando.nombre,
                        apellido: editando.apellido,
                        email: editando.email,
                        telefono: editando.telefono,
                        rol: editando.rol
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.mensaje || "Error al modificar usuario");
            }

            alert("Usuario modificado correctamente");

            setEditando(null);
            obtenerUsuarios();

        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    // Obtener iniciales
    const obtenerIniciales = (nombre, apellido) => {
        return `${nombre?.charAt(0) || ""}${apellido?.charAt(0) || ""}`.toUpperCase();
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return "Sin fecha";
        return new Date(fecha).toLocaleDateString("es-AR");
    };

    return (
        <>
            <h1 className="text-xl font-bold">Usuarios</h1>

            <p className="mb-5 text-xs text-muted">
                Gestión de usuarios registrados
            </p>

            {/* Información general */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-line bg-white/5 p-4">
                    <p className="text-[11px] text-muted">
                        Usuarios registrados
                    </p>

                    <p className="my-1 text-3xl font-bold">
                        {usuarios.length}
                    </p>

                    <p className="text-[11px] text-muted">
                        Datos obtenidos de la base de datos
                    </p>
                </div>

                <div className="rounded-lg border border-line bg-white/5 p-4">
                    <p className="text-[11px] text-muted">
                        Estado de conexión
                    </p>

                    <p className="my-1 text-xl font-bold">
                        {cargando ? "Consultando..." : error ? "Error" : "Conectado"}
                    </p>

                    <p className="text-[11px] text-muted">
                        API de usuarios
                    </p>
                </div>
            </section>

            {/* Tabla de usuarios */}
            <section className="mt-3 rounded-lg border border-line bg-white/5 p-4">

                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold">
                            Lista de usuarios
                        </h2>

                        <p className="text-[11px] text-muted">
                            Usuarios almacenados en MySQL
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={obtenerUsuarios}
                        className="rounded-md border border-line px-3 py-2 text-xs hover:bg-white/10"
                    >
                        <i className="bi bi-arrow-clockwise mr-2"></i>
                        Actualizar
                    </button>
                </div>

                {/* Estados de carga */}
                {cargando ? (
                    <p className="py-8 text-center text-sm text-muted">
                        Cargando usuarios...
                    </p>
                ) : error ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-red-400">{error}</p>

                        <button
                            onClick={obtenerUsuarios}
                            className="mt-3 rounded-md border border-line px-3 py-2 text-xs"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : usuarios.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted">
                        No hay usuarios registrados.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">

                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-muted">
                                    <th className="py-2 font-semibold">Usuario</th>
                                    <th className="py-2 font-semibold">Email</th>
                                    <th className="py-2 font-semibold">Teléfono</th>
                                    <th className="py-2 font-semibold">Rol</th>
                                    <th className="py-2 font-semibold">Fecha de registro</th>
                                    <th className="py-2 text-right font-semibold">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr
                                        key={usuario.id_usuario}
                                        className="border-t border-line"
                                    >
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[11px] font-bold text-blue-400">
                                                    {obtenerIniciales(
                                                        usuario.nombre,
                                                        usuario.apellido
                                                    )}
                                                </div>

                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-bold">
                                                        {usuario.nombre} {usuario.apellido}
                                                    </span>

                                                    <span className="text-[11px] text-muted">
                                                        ID: {usuario.id_usuario}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3">
                                            {usuario.email}
                                        </td>

                                        <td className="py-3">
                                            {usuario.telefono || "Sin teléfono"}
                                        </td>

                                        {/* Rol */}
                                        <td className="py-3">
                                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                usuario.rol === "admin"
                                                    ? "bg-blue-500/15 text-blue-400"
                                                    : "bg-white/10 text-slate-300"
                                            }`}>
                                                {usuario.rol === "admin" ? "Administrador" : "Usuario"}
                                            </span>
                                        </td>

                                        <td className="py-3 text-muted">
                                            {formatearFecha(usuario.fecha_registro)}
                                        </td>

                                        <td className="py-3">
                                            <div className="flex justify-end gap-3 text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditando({ ...usuario })}
                                                    className="text-muted hover:text-white"
                                                    title="Editar usuario"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => eliminar(usuario.id_usuario)}
                                                    className="text-red-400 hover:text-red-300"
                                                    title="Eliminar usuario"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!cargando && !error && (
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
                        <span>Mostrando {usuarios.length} usuarios</span>
                    </div>
                )}
            </section>

            {/* Modal de edición */}
            {editando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

                    <form
                        onSubmit={guardar}
                        className="w-full max-w-sm rounded-lg border border-line bg-sidebar p-5"
                    >
                        <h2 className="mb-4 text-sm font-bold">
                            Editar usuario
                        </h2>

                        {/* Nombre */}
                        <label className="mb-1 block text-[11px] text-muted">
                            Nombre
                        </label>

                        <input
                            type="text"
                            required
                            value={editando.nombre || ""}
                            onChange={(e) =>
                                setEditando({
                                    ...editando,
                                    nombre: e.target.value
                                })
                            }
                            className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
                        />

                        {/* Apellido */}
                        <label className="mb-1 block text-[11px] text-muted">
                            Apellido
                        </label>

                        <input
                            type="text"
                            required
                            value={editando.apellido || ""}
                            onChange={(e) =>
                                setEditando({
                                    ...editando,
                                    apellido: e.target.value
                                })
                            }
                            className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
                        />

                        {/* Email */}
                        <label className="mb-1 block text-[11px] text-muted">
                            Email
                        </label>

                        <input
                            type="email"
                            required
                            value={editando.email || ""}
                            onChange={(e) =>
                                setEditando({
                                    ...editando,
                                    email: e.target.value
                                })
                            }
                            className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
                        />

                        {/* Teléfono */}
                        <label className="mb-1 block text-[11px] text-muted">
                            Teléfono
                        </label>

                        <input
                            type="text"
                            value={editando.telefono || ""}
                            onChange={(e) =>
                                setEditando({
                                    ...editando,
                                    telefono: e.target.value
                                })
                            }
                            className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
                        />

                        {/* Rol */}
                        <label className="mb-1 block text-[11px] text-muted">
                            Rol
                        </label>

                        <select
                            required
                            value={editando.rol || "usuario"}
                            onChange={(e) =>
                                setEditando({
                                    ...editando,
                                    rol: e.target.value
                                })
                            }
                            className="mb-4 w-full rounded-md border border-line bg-[#172536] px-3 py-2 text-xs text-white"
                        >
                            <option value="usuario">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>

                        {/* Botones */}
                        <div className="flex justify-end gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setEditando(null)}
                                className="rounded-md border border-line px-3 py-1.5"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="rounded-md bg-blue-500 px-3 py-1.5 font-semibold text-white"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}

export default Usuarios;
