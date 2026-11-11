
import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/usuarios";

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [editando, setEditando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

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

    const eliminar = async (id) => {
        if (!window.confirm("¿Seguro que querés eliminar este usuario?")) return;

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

    const guardar = async (e) => {
        e.preventDefault();

        try {
            const respuesta = await fetch(`${API_URL}/${editando.id_usuario}`, {
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
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.mensaje || "Error al modificar usuario");
            }

            setEditando(null);
            await obtenerUsuarios();

            alert("Usuario modificado correctamente");

        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    const obtenerIniciales = (nombre, apellido) => {
        return `${nombre?.charAt(0) || ""}${apellido?.charAt(0) || ""}`.toUpperCase();
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "Sin fecha";
        return new Date(fecha).toLocaleDateString("es-AR");
    };

    const totalAdmins = usuarios.filter((u) => u.rol === "admin").length;
    const totalUsuarios = usuarios.filter((u) => u.rol === "usuario").length;

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-1 flex items-center gap-2 text-blue-400">
                        <i className="bi bi-people-fill"></i>
                        <span className="text-[11px] font-bold uppercase tracking-[2px]">
                            Administración
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Gestión de usuarios
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Administrá las cuentas, los permisos y los roles del sistema.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={obtenerUsuarios}
                    disabled={cargando}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300 disabled:opacity-50"
                >
                    <i className={`bi bi-arrow-clockwise ${cargando ? "animate-spin" : ""}`}></i>
                    Actualizar lista
                </button>
            </div>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Total de usuarios
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-white">
                                {usuarios.length}
                            </h2>

                            <p className="mt-1 text-[11px] text-slate-500">
                                Cuentas registradas
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
                            <i className="bi bi-people-fill"></i>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Administradores
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-white">
                                {totalAdmins}
                            </h2>

                            <p className="mt-1 text-[11px] text-slate-500">
                                Cuentas con acceso administrativo
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-xl text-purple-400">
                            <i className="bi bi-shield-lock-fill"></i>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-500/30 sm:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400">
                                Usuarios comunes
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-white">
                                {totalUsuarios}
                            </h2>

                            <p className="mt-1 text-[11px] text-slate-500">
                                Cuentas estándar del sistema
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-400">
                            <i className="bi bi-person-fill"></i>
                        </div>
                    </div>
                </div>

            </section>

            <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">

                <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Lista de usuarios
                        </h2>

                        <p className="mt-1 text-[11px] text-slate-400">
                            Información almacenada en la base de datos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className={`h-2 w-2 rounded-full ${error ? "bg-red-400" : cargando ? "bg-yellow-400" : "bg-emerald-400"}`}></span>
                        {error ? "Error de conexión" : cargando ? "Consultando API..." : "API conectada"}
                    </div>
                </div>

                {cargando ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500"></div>
                        <p className="mt-3 text-xs text-slate-400">
                            Cargando usuarios...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-14">
                        <i className="bi bi-exclamation-circle text-3xl text-red-400"></i>
                        <p className="mt-3 text-sm text-red-400">{error}</p>

                        <button
                            onClick={obtenerUsuarios}
                            className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/10"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : usuarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <i className="bi bi-person-x text-4xl text-slate-500"></i>
                        <p className="mt-3 text-sm font-medium text-slate-300">
                            No hay usuarios registrados
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Cuando se registren aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-xs">

                            <thead className="bg-white/[0.03]">
                                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                                    <th className="px-5 py-4 font-semibold">Usuario</th>
                                    <th className="px-4 py-4 font-semibold">Correo electrónico</th>
                                    <th className="px-4 py-4 font-semibold">Teléfono</th>
                                    <th className="px-4 py-4 font-semibold">Rol</th>
                                    <th className="px-4 py-4 font-semibold">Registro</th>
                                    <th className="px-5 py-4 text-right font-semibold">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr
                                        key={usuario.id_usuario}
                                        className="border-t border-white/[0.06] transition hover:bg-white/[0.025]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                                    usuario.rol === "admin"
                                                        ? "bg-purple-500/15 text-purple-400"
                                                        : "bg-blue-500/15 text-blue-400"
                                                }`}>
                                                    {obtenerIniciales(usuario.nombre, usuario.apellido)}
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-200">
                                                        {usuario.nombre} {usuario.apellido}
                                                    </span>

                                                    <span className="mt-1 text-[10px] text-slate-500">
                                                        ID #{usuario.id_usuario}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 text-slate-300">
                                            {usuario.email}
                                        </td>

                                        <td className="px-4 py-4 text-slate-400">
                                            {usuario.telefono || "Sin teléfono"}
                                        </td>

                                        <td className="px-4 py-4">
                                            {usuario.rol === "admin" ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold text-purple-300">
                                                    <i className="bi bi-shield-fill-check"></i>
                                                    Administrador
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-300">
                                                    <i className="bi bi-person-fill"></i>
                                                    Usuario
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-slate-400">
                                            {formatearFecha(usuario.fecha_registro)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditando({ ...usuario })}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                                                    title="Editar usuario"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => eliminar(usuario.id_usuario)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                                                    title="Eliminar usuario"
                                                >
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

                {!cargando && !error && usuarios.length > 0 && (
                    <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
                        <p className="text-[11px] text-slate-500">
                            Mostrando <span className="font-semibold text-slate-300">{usuarios.length}</span> usuarios
                        </p>

                        <p className="text-[11px] text-slate-500">
                            <i className="bi bi-database mr-1"></i>
                            MySQL
                        </p>
                    </div>
                )}

            </section>

            {editando && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setEditando(null)}
                >
                    <form
                        onSubmit={guardar}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#111b2b] shadow-2xl shadow-black/40"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div>
                                <h2 className="text-base font-bold text-white">
                                    Editar usuario
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Modificá los datos de la cuenta.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditando(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-4 p-6">

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={editando.nombre || ""}
                                    onChange={(e) => setEditando({
                                        ...editando,
                                        nombre: e.target.value
                                    })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                                    Apellido
                                </label>

                                <input
                                    type="text"
                                    required
                                    value={editando.apellido || ""}
                                    onChange={(e) => setEditando({
                                        ...editando,
                                        apellido: e.target.value
                                    })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                                    Correo electrónico
                                </label>

                                <input
                                    type="email"
                                    required
                                    value={editando.email || ""}
                                    onChange={(e) => setEditando({
                                        ...editando,
                                        email: e.target.value
                                    })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                                    Teléfono
                                </label>

                                <input
                                    type="text"
                                    value={editando.telefono || ""}
                                    onChange={(e) => setEditando({
                                        ...editando,
                                        telefono: e.target.value
                                    })}
                                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                                    Rol de usuario
                                </label>

                                <select
                                    required
                                    value={editando.rol || "usuario"}
                                    onChange={(e) => setEditando({
                                        ...editando,
                                        rol: e.target.value
                                    })}
                                    className="w-full rounded-lg border border-white/10 bg-[#172536] px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                >
                                    <option value="usuario">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>

                                <p className="mt-2 text-[10px] text-slate-500">
                                    <i className="bi bi-info-circle mr-1"></i>
                                    El rol determina los permisos de acceso a la plataforma.
                                </p>
                            </div>

                        </div>

                        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setEditando(null)}
                                className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
                            >
                                <i className="bi bi-check2"></i>
                                Guardar cambios
                            </button>
                        </div>

                    </form>
                </div>
            )}

        </div>
    );
}

export default Usuarios;
