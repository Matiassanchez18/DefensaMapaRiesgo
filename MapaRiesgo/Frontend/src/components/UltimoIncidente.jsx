
function UltimoIncidente({ incidente }) {
  if (!incidente) {
    return (
      <section className="rounded-lg border border-slate-700 bg-[#1B2B3A] p-6">
        <h2 className="font-semibold text-white">
          Último incidente reportado
        </h2>

        <p className="mt-4 text-slate-400">
          Todavía no hay incidentes registrados.
        </p>
      </section>
    );
  }

  const { nombreDelito, descripcion, nivelRiesgo, direccion } = incidente;

  const coloresRiesgo = {
    alta: "bg-red-600 text-white border-red-500",
    media: "bg-orange-500 text-white border-orange-400",
    baja: "bg-green-600 text-white border-green-500",
  };

  const nivel = nivelRiesgo?.toString().trim().toLowerCase();

  const colorNivel =
    coloresRiesgo[nivel] ||
    "bg-gray-500 text-white border-gray-400";

  return (
    <section className="overflow-hidden rounded-lg border border-slate-700 bg-[#1B2B3A]">

      <header className="border-b border-slate-700 px-4 py-3">
        <h2 className="font-semibold text-white">
          Último incidente reportado
        </h2>
      </header>

      <div className="px-4 py-6">

        <h2 className="text-2xl font-bold text-white">
          {nombreDelito || "Incidente reportado"}
        </h2>

        <div className="mt-4">
          <p className="mb-1 text-sm font-semibold text-slate-300">
            Descripción del hecho
          </p>

          <p className="line-clamp-4 break-words text-sm leading-relaxed text-slate-400">
            {descripcion || "Sin descripción disponible."}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-300">
            Nivel de riesgo del delito:
          </span>

          <span
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${colorNivel}`}
          >
            {nivelRiesgo || "No especificado"}
          </span>
        </div>

        {direccion && (
          <div className="mt-5 border-t border-slate-700 pt-4">
            <p className="break-words text-sm text-slate-300">
              <strong>Dirección:</strong> {direccion}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

export default UltimoIncidente;
