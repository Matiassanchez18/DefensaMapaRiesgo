function UltimoIncidente({ incidente }) {
  const { zona, tiempo, titulo, nivelRiesgo } = incidente;
  return (
    <div>
      <section className="overflow-hidden rounded-lg border border-slate-700 bg-[#1B2B3A]">
        <a href="#">
          <header className="border-b border-slate-700 px-4 py-3 text-slate-300">
            <span className="">
              {zona}, {tiempo}
            </span>
          </header>
          <div className="px-4 py-10">
            <h2 className="text-2xl font-bold text-white py-5">{titulo}</h2>

            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full bg-gray-500 px-3 py-1 text-sm text-white">
                Tipo de Riesgo:{" "}
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm text-white">
                {nivelRiesgo}
              </span>
            </div>
          </div>
        </a>
      </section>
    </div>
  );
}
export default UltimoIncidente;
