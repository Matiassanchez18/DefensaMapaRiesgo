
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

  const { titulo, nivelRiesgo } = incidente;

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
    <div>
      <section className="overflow-hidden rounded-lg border border-slate-700 bg-[#1B2B3A]">

        <header className="border-b border-slate-700 px-4 py-3 text-slate-300">
          <h2 className="font-semibold text-white">
            Último incidente reportado
          </h2>
        </header>

        <div className="px-4 py-10">

          <h2 className="py-5 text-2xl font-bold text-white">
            {titulo}
          </h2>

          <div className="mt-6 flex items-center gap-3">

            <span className="text-sm text-slate-300">
              Nivel de riesgo:
            </span>

            <span
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${colorNivel}`}
            >
              {nivelRiesgo}
            </span>

          </div>
        </div>
      </section>
    </div>
  );
}

export default UltimoIncidente;
