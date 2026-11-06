import "../Style/Mapa.css"

function ReporteMapa() {
  return (
    <div className="card-reporte">
      <div className="mb-4 flex w-full max-w-xl mx-auto p-2 mt-2">
        <div className="rounded-xl border border-gray-700 bg-[#1b263b] p-4 shadow-md">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-500">
            Entrando a una zona peligrosa
            <i className="bi bi-exclamation-circle"></i>
          </h2>

          <p className="mb-3 flex items-center gap-2 text-sm text-gray-300">
            Zona norte - hace 20 min - tipo de peligro
            <i className="bi bi-circle-fill text-red-500"></i>
          </p>

          <p className="mb-0 text-gray-200">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita,
            officiis. Eligendi dolorum blanditiis beatae aspernatur?
          </p>
        </div>
      </div>
    </div>
  );
}
export default ReporteMapa;
