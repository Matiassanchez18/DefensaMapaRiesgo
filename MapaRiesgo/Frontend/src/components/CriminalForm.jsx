import { useState } from "react";

// Letras (con tildes y ñ) separadas por un espacio, guion o apóstrofe
const SOLO_LETRAS = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

const ESTADOS = ["Buscado", "Capturado"];

const inputBase =
    "w-full rounded-lg border bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2";

const claseInput = (hayError) =>
    `${inputBase} ${hayError
        ? "border-red-400/60 focus:border-red-400 focus:ring-red-500/10"
        : "border-white/10 focus:border-blue-500 focus:ring-blue-500/10"
    }`;

// Fecha de hoy en formato AAAA-MM-DD (hora local)
const fechaDeHoy = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${hoy.getFullYear()}-${mes}-${dia}`;
};

// ---------- Validaciones (las mismas reglas que el backend) ----------

const validarNombreApellido = (valor, etiqueta) => {
    const texto = valor.trim();

    if (!texto) return `El ${etiqueta} es obligatorio`;
    if (texto.length < 2) return `El ${etiqueta} debe tener al menos 2 caracteres`;
    if (texto.length > 100) return `El ${etiqueta} es demasiado largo (máximo 100)`;
    if (!SOLO_LETRAS.test(texto)) {
        return `El ${etiqueta} solo puede tener letras, espacios, guiones o apóstrofes`;
    }
    return "";
};

const esFechaReal = (texto) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;

    const [anio, mes, dia] = texto.split("-").map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));

    return (
        fecha.getUTCFullYear() === anio &&
        fecha.getUTCMonth() === mes - 1 &&
        fecha.getUTCDate() === dia
    );
};

const validarFecha = (valor) => {
    const texto = valor.trim();

    if (!texto) return "";
    if (!esFechaReal(texto)) return "La fecha de nacimiento no es válida";
    if (texto < "1900-01-01") return "La fecha de nacimiento no puede ser anterior a 1900";
    if (texto > fechaDeHoy()) return "La fecha de nacimiento no puede ser futura";
    return "";
};

const validarOrden = (valor) => {
    if (valor.trim().length > 100) return "La orden de búsqueda no puede superar los 100 caracteres";
    return "";
};

const validarFoto = (valor) => {
    const texto = valor.trim();

    if (!texto) return "";
    if (texto.length > 255) return "El enlace de la foto es demasiado largo (máximo 255 caracteres)";

    try {
        const url = new URL(texto);
        if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    } catch {
        return "La foto debe ser un enlace que empiece con http:// o https://";
    }
    return "";
};

const validarDescripcion = (valor) => {
    if (valor.trim().length > 1000) return "La descripción no puede superar los 1000 caracteres";
    return "";
};

const validarEstado = (valor) => {
    if (!ESTADOS.includes(valor)) return "El estado debe ser Buscado o Capturado";
    return "";
};

const validarCampo = (name, valor) => {
    switch (name) {
        case "nombre":
            return validarNombreApellido(valor, "nombre");
        case "apellido":
            return validarNombreApellido(valor, "apellido");
        case "fecha_nacimiento":
            return validarFecha(valor);
        case "orden_busqueda":
            return validarOrden(valor);
        case "foto":
            return validarFoto(valor);
        case "descripcion":
            return validarDescripcion(valor);
        case "estado":
            return validarEstado(valor);
        default:
            return "";
    }
};

const CAMPOS = [
    "nombre",
    "apellido",
    "fecha_nacimiento",
    "estado",
    "orden_busqueda",
    "foto",
    "descripcion",
];

// ---------- Componente ----------
// criminal = null  -> se está agregando uno nuevo
// criminal = {...} -> se está editando ese criminal
// onGuardar(datos) debe devolver null si salió bien o { mensaje, errores } si falló

function CriminalForm({ criminal, onCancelar, onGuardar }) {
    const esEdicion = Boolean(criminal);

    const [datos, setDatos] = useState({
        nombre: criminal?.nombre || "",
        apellido: criminal?.apellido || "",
        fecha_nacimiento: criminal?.fecha_nacimiento || "",
        estado: criminal?.estado || "Buscado",
        orden_busqueda: criminal?.orden_busqueda || "",
        foto: criminal?.foto || "",
        descripcion: criminal?.descripcion || "",
    });
    const [errores, setErrores] = useState({});
    const [errorServidor, setErrorServidor] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatos({ ...datos, [name]: value });

        // Si el campo ya tenía un error, se revalida mientras escribe
        if (errores[name]) {
            setErrores({ ...errores, [name]: validarCampo(name, value) });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setErrores({ ...errores, [name]: validarCampo(name, value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorServidor("");

        const nuevosErrores = {};
        CAMPOS.forEach((name) => {
            const mensaje = validarCampo(name, datos[name]);
            if (mensaje) nuevosErrores[name] = mensaje;
        });

        setErrores(nuevosErrores);

        const primerError = CAMPOS.find((name) => nuevosErrores[name]);
        if (primerError) {
            document.getElementById(`criminal-${primerError}`)?.focus();
            return;
        }

        setEnviando(true);

        const fallo = await onGuardar({
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            fecha_nacimiento: datos.fecha_nacimiento.trim(),
            estado: datos.estado,
            orden_busqueda: datos.orden_busqueda.trim(),
            foto: datos.foto.trim(),
            descripcion: datos.descripcion.trim(),
        });

        // Si salió bien, la página cierra el formulario y no hay nada más que hacer
        if (!fallo) return;

        setEnviando(false);

        if (fallo.errores?.length > 0) {
            const erroresServidor = {};
            fallo.errores.forEach(({ campo, mensaje }) => {
                erroresServidor[campo] = mensaje;
            });
            setErrores(erroresServidor);
        } else {
            setErrorServidor(fallo.mensaje || "No se pudo guardar el criminal");
        }
    };

    const mensajeError = (name) =>
        errores[name] && (
            <p id={`criminal-${name}-error`} className="mt-1.5 text-[11px] text-red-400" role="alert">
                {errores[name]}
            </p>
        );

    const propsCampo = (name) => ({
        id: `criminal-${name}`,
        name,
        value: datos[name],
        onChange: handleChange,
        onBlur: handleBlur,
        "aria-invalid": Boolean(errores[name]),
        "aria-describedby": errores[name] ? `criminal-${name}-error` : undefined,
        className: claseInput(Boolean(errores[name])),
    });

    const etiqueta = "mb-1.5 block text-xs font-medium text-slate-300";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onCancelar}
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                noValidate
                className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111b2b] shadow-2xl shadow-black/40"
            >
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-base font-bold text-white">
                            {esEdicion ? "Editar criminal" : "Agregar criminal"}
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            {esEdicion
                                ? "Modificá los datos del criminal."
                                : "Completá los datos del nuevo criminal."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancelar}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto p-6">

                    {errorServidor && (
                        <p
                            className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
                            role="alert"
                        >
                            {errorServidor}
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="criminal-nombre" className={etiqueta}>Nombre</label>
                            <input
                                {...propsCampo("nombre")}
                                type="text"
                                maxLength={100}
                                placeholder="Nombre"
                            />
                            {mensajeError("nombre")}
                        </div>

                        <div>
                            <label htmlFor="criminal-apellido" className={etiqueta}>Apellido</label>
                            <input
                                {...propsCampo("apellido")}
                                type="text"
                                maxLength={100}
                                placeholder="Apellido"
                            />
                            {mensajeError("apellido")}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="criminal-fecha_nacimiento" className={etiqueta}>
                                Fecha de nacimiento <span className="text-slate-500">(opcional)</span>
                            </label>
                            <input
                                {...propsCampo("fecha_nacimiento")}
                                type="date"
                                max={fechaDeHoy()}
                            />
                            {mensajeError("fecha_nacimiento")}
                        </div>

                        <div>
                            <label htmlFor="criminal-estado" className={etiqueta}>Estado</label>
                            <select
                                {...propsCampo("estado")}
                                className={`${claseInput(Boolean(errores.estado))} bg-[#172536]`}
                            >
                                {ESTADOS.map((estado) => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                            {mensajeError("estado")}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="criminal-orden_busqueda" className={etiqueta}>
                            Orden de búsqueda <span className="text-slate-500">(opcional)</span>
                        </label>
                        <input
                            {...propsCampo("orden_busqueda")}
                            type="text"
                            maxLength={100}
                            placeholder="Ej: Orden de captura N.° 2026-001"
                        />
                        {mensajeError("orden_busqueda")}
                    </div>

                    <div>
                        <label htmlFor="criminal-foto" className={etiqueta}>
                            Enlace de la foto <span className="text-slate-500">(opcional)</span>
                        </label>
                        <input
                            {...propsCampo("foto")}
                            type="url"
                            maxLength={255}
                            placeholder="https://..."
                        />
                        {errores.foto ? (
                            mensajeError("foto")
                        ) : (
                            <p className="mt-1.5 text-[10px] text-slate-500">
                                <i className="bi bi-info-circle mr-1"></i>
                                Si lo dejás vacío se genera una foto automática.
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="criminal-descripcion" className={etiqueta}>
                            Descripción <span className="text-slate-500">(opcional)</span>
                        </label>
                        <textarea
                            {...propsCampo("descripcion")}
                            rows={4}
                            maxLength={1000}
                            placeholder="Rasgos, delito, última ubicación conocida..."
                        />
                        {mensajeError("descripcion")}
                    </div>

                </div>

                <div className="flex justify-end gap-3 border-t border-white/10 bg-white/[0.02] px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancelar}
                        className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={enviando}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <i className="bi bi-check2"></i>
                        {enviando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Agregar criminal"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CriminalForm;
