import { useState } from "react";

// La fecha llega como texto "AAAA-MM-DD" desde el backend
const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha de nacimiento";

    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
};

const calcularEdad = (fecha) => {
    if (!fecha) return null;

    const [anio, mes, dia] = fecha.split("-").map(Number);
    const hoy = new Date();

    let edad = hoy.getFullYear() - anio;
    const yaCumplio =
        hoy.getMonth() + 1 > mes || (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);

    if (!yaCumplio) edad--;

    return edad;
};

function CriminalCard({ criminal, onEditar, onEliminar }) {
    // Se guarda la URL que falló, así si se edita la foto se vuelve a intentar cargar
    const [fotoFallida, setFotoFallida] = useState(null);

    const capturado = criminal.estado === "Capturado";
    const mostrarFoto = criminal.foto && fotoFallida !== criminal.foto;
    const edad = calcularEdad(criminal.fecha_nacimiento);

    return (
        <article className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-blue-500/30">

            <div className="relative aspect-[4/3] w-full bg-black/20">
                {mostrarFoto ? (
                    <img
                        src={criminal.foto}
                        alt={`Foto de ${criminal.nombre} ${criminal.apellido}`}
                        loading="lazy"
                        onError={() => setFotoFallida(criminal.foto)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-600">
                        <i className="bi bi-person-fill text-6xl"></i>
                        <span className="text-[10px]">Sin foto</span>
                    </div>
                )}

                <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border bg-black/60 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${capturado
                            ? "border-emerald-400/30 text-emerald-300"
                            : "border-red-400/30 text-red-300"
                        }`}
                >
                    <i className={`bi ${capturado ? "bi-shield-fill-check" : "bi-exclamation-triangle-fill"}`}></i>
                    {capturado ? "Capturado" : "Buscado"}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-4">

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">
                        {criminal.nombre} {criminal.apellido}
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                        ID #{criminal.id_criminal}
                    </p>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                        <i className="bi bi-calendar3 text-slate-500"></i>
                        <span>
                            {formatearFecha(criminal.fecha_nacimiento)}
                            {edad !== null && ` · ${edad} años`}
                        </span>
                    </div>

                    <div className="flex items-start gap-2">
                        <i className="bi bi-file-earmark-text text-slate-500"></i>
                        <span>{criminal.orden_busqueda || "Sin orden de búsqueda"}</span>
                    </div>
                </div>

                <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-slate-400">
                    {criminal.descripcion || "Sin descripción."}
                </p>

                <div className="mt-auto flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                    <button
                        type="button"
                        onClick={() => onEditar(criminal)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                        title="Editar criminal"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>

                    <button
                        type="button"
                        onClick={() => onEliminar(criminal)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                        title="Eliminar criminal"
                    >
                        <i className="bi bi-trash3"></i>
                    </button>
                </div>

            </div>
        </article>
    );
}

export default CriminalCard;
