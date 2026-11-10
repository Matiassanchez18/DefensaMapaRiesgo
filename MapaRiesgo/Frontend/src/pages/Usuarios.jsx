import { useState } from "react";

const usuariosIniciales = [
  { id: 1, iniciales: "MS", nombre: "Martina Sosa", email: "martina.sosa@mail.com", rol: "Administrador", zona: "Todas", reportes: 48, estado: "Activo", ultimoAcceso: "hace 5 min" },
  { id: 2, iniciales: "LH", nombre: "Lucas Herrera", email: "lucas.herrera@mail.com", rol: "Moderador", zona: "Zona Norte", reportes: 132, estado: "Activo", ultimoAcceso: "hace 20 min" },
  { id: 3, iniciales: "CR", nombre: "Camila Ríos", email: "camila.rios@mail.com", rol: "Moderador", zona: "Zona Centro", reportes: 97, estado: "Activo", ultimoAcceso: "hace 1 h" },
  { id: 4, iniciales: "JP", nombre: "Joaquín Paz", email: "joaquin.paz@mail.com", rol: "Usuario", zona: "Zona Sur", reportes: 14, estado: "Inactivo", ultimoAcceso: "hace 6 días" },
  { id: 5, iniciales: "VC", nombre: "Valentina Cruz", email: "vale.cruz@mail.com", rol: "Usuario", zona: "Zona Este", reportes: 23, estado: "Activo", ultimoAcceso: "hace 3 h" },
  { id: 6, iniciales: "ML", nombre: "Mateo Lagos", email: "mateo.lagos@mail.com", rol: "Usuario", zona: "Zona Oeste", reportes: 3, estado: "Suspendido", ultimoAcceso: "hace 12 días" },
];

const colorEstado = {
  Activo: "bg-green-500",
  Inactivo: "bg-gray-500",
  Suspendido: "bg-red-400",
};

function Usuarios() {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [editando, setEditando] = useState(null);

  const cards = [
    { titulo: "Usuarios totales", numero: "1.254", detalle: "+4% vs. mes anterior", color: "text-green-400" },
    { titulo: "Administradores", numero: "4", detalle: "Acceso completo", color: "text-muted" },
    { titulo: "Moderadores", numero: "12", detalle: "3 con reportes pendientes", color: "text-yellow-400" },
    { titulo: "Suspendidos", numero: "7", detalle: "Cuentas bloqueadas", color: "text-red-400" },
  ];

  const eliminar = (id) => {
    if (window.confirm("¿Seguro que querés eliminar este usuario?")) {
      setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
    }
  };

  const guardar = (e) => {
    e.preventDefault();
    setUsuarios(
      usuarios.map((usuario) => (usuario.id === editando.id ? editando : usuario))
    );
    setEditando(null);
  };

  return (
    <>
      <h1 className="text-xl font-bold">Usuarios</h1>
      <p className="mb-5 text-xs text-muted">Gestión de usuarios y permisos</p>

      {/* Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.titulo} className="rounded-lg border border-line bg-white/5 p-4">
            <p className="text-[11px] text-muted">{card.titulo}</p>
            <p className="my-1 text-3xl font-bold">{card.numero}</p>
            <p className={`text-[11px] ${card.color}`}>{card.detalle}</p>
          </div>
        ))}
      </section>

      {/* Tabla de usuarios */}
      <section className="mt-3 rounded-lg border border-line bg-white/5 p-4">
        {/* Filtros */}
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Buscar por nombre o email"
            className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
          />
          <select className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs">
            <option>Todos los roles</option>
            <option>Administrador</option>
            <option>Moderador</option>
            <option>Usuario</option>
          </select>
          <select className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs">
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>Inactivo</option>
            <option>Suspendido</option>
          </select>
          <select className="rounded-md border border-line bg-black/30 px-3 py-2 text-xs">
            <option>Todas las zonas</option>
            <option>Zona Norte</option>
            <option>Zona Centro</option>
            <option>Zona Sur</option>
            <option>Zona Este</option>
            <option>Zona Oeste</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                <th className="py-2 font-semibold">Usuario</th>
                <th className="py-2 font-semibold">Rol</th>
                <th className="py-2 font-semibold">Zona</th>
                <th className="py-2 font-semibold">Reportes</th>
                <th className="py-2 font-semibold">Estado</th>
                <th className="py-2 font-semibold">Último acceso</th>
                <th className="py-2 text-right font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-t border-line">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[11px] font-bold text-blue-400">
                        {usuario.iniciales}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold">{usuario.nombre}</span>
                        <span className="text-[11px] text-muted">{usuario.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">{usuario.rol}</td>
                  <td className="py-3">{usuario.zona}</td>
                  <td className="py-3">{usuario.reportes}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${colorEstado[usuario.estado]}`}></span>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{usuario.ultimoAcceso}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => setEditando(usuario)}
                        className="text-muted hover:text-white"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(usuario.id)}
                        className="text-red-400 hover:text-red-300"
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

        {/* Pie de la tabla */}
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
          <span>Mostrando 1–{usuarios.length} de 1.254</span>
          <div className="flex gap-1.5">
            <button type="button" className="rounded-md border border-line px-2.5 py-1">
              Anterior
            </button>
            <button type="button" className="rounded-md border border-line px-2.5 py-1">
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {/* Formulario de edición */}
      {editando && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={guardar}
            className="w-full max-w-sm rounded-lg border border-line bg-sidebar p-5"
          >
            <h2 className="mb-4 text-sm font-bold">Editar usuario</h2>

            <p className="mb-1 text-[11px] text-muted">Nombre</p>
            <input
              type="text"
              value={editando.nombre}
              onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
              className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            />

            <p className="mb-1 text-[11px] text-muted">Email</p>
            <input
              type="email"
              value={editando.email}
              onChange={(e) => setEditando({ ...editando, email: e.target.value })}
              className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            />

            <p className="mb-1 text-[11px] text-muted">Rol</p>
            <select
              value={editando.rol}
              onChange={(e) => setEditando({ ...editando, rol: e.target.value })}
              className="mb-3 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            >
              <option value="Administrador">Administrador</option>
              <option value="Moderador">Moderador</option>
              <option value="Usuario">Usuario</option>
            </select>

            <p className="mb-1 text-[11px] text-muted">Estado</p>
            <select
              value={editando.estado}
              onChange={(e) => setEditando({ ...editando, estado: e.target.value })}
              className="mb-4 w-full rounded-md border border-line bg-black/30 px-3 py-2 text-xs"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Suspendido">Suspendido</option>
            </select>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditando(null)}
                className="rounded-md border border-line px-3 py-1.5"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-md bg-blue-500 px-3 py-1.5 font-semibold text-white">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Usuarios;