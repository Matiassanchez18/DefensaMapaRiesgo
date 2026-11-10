import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import "../style/Register.css";

const API_URL = "http://localhost:3000/api/register";

// Letras (con tildes y ñ), separadas por un espacio, guion o apóstrofe
const SOLO_LETRAS = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
// Misma regla de email que usa zod en el backend, así los dos validan igual
const EMAIL_VALIDO =
    /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

// Campos del formulario (en el orden en que se muestran)
const CAMPOS = [
    {
        name: "nombre",
        label: "Nombre",
        type: "text",
        placeholder: "Tu nombre",
        autoComplete: "given-name",
        maxLength: 50,
    },
    {
        name: "apellido",
        label: "Apellido",
        type: "text",
        placeholder: "Tu apellido",
        autoComplete: "family-name",
        maxLength: 50,
    },
    {
        name: "email",
        label: "Correo electrónico",
        type: "email",
        placeholder: "tucorreo@ejemplo.com",
        autoComplete: "email",
        maxLength: 150,
    },
    {
        name: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "Creá una contraseña",
        autoComplete: "new-password",
        maxLength: 64,
        ayuda: "Mínimo 8 caracteres, con al menos una letra y un número.",
    },
    {
        name: "telefono",
        label: "Teléfono",
        type: "tel",
        placeholder: "+54 381 555 1234",
        autoComplete: "tel",
        maxLength: 20,
    },
];

// ---------- Validaciones (las mismas reglas que el backend) ----------

const validarNombreApellido = (valor, etiqueta) => {
    const texto = valor.trim();

    if (!texto) return `El ${etiqueta} es obligatorio`;
    if (texto.length < 2) return `El ${etiqueta} debe tener al menos 2 caracteres`;
    if (texto.length > 50) return `El ${etiqueta} es demasiado largo (máximo 50)`;
    if (!SOLO_LETRAS.test(texto)) {
        return `El ${etiqueta} solo puede tener letras, espacios, guiones o apóstrofes`;
    }
    return "";
};

const validarEmail = (valor) => {
    const texto = valor.trim();

    if (!texto) return "El email es obligatorio";
    if (texto.length > 150) return "El email es demasiado largo (máximo 150)";
    if (!EMAIL_VALIDO.test(texto)) {
        return "Ingresá un email válido, por ejemplo tucorreo@ejemplo.com";
    }
    return "";
};

const validarPassword = (valor) => {
    if (!valor) return "La contraseña es obligatoria";
    if (/\s/.test(valor)) return "La contraseña no puede tener espacios";
    if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (valor.length > 64) return "La contraseña es demasiado larga (máximo 64)";
    if (!/[A-Za-z]/.test(valor)) return "La contraseña debe tener al menos una letra";
    if (!/\d/.test(valor)) return "La contraseña debe tener al menos un número";
    return "";
};

const validarTelefono = (valor) => {
    const texto = valor.trim();

    if (!texto) return "El teléfono es obligatorio";
    if (!/^\+?[\d\s-]+$/.test(texto)) {
        return "El teléfono solo puede tener números, espacios, guiones y un + al inicio";
    }

    const cantidad = texto.replace(/\D/g, "").length;
    if (cantidad < 8 || cantidad > 15) {
        return "El teléfono debe tener entre 8 y 15 dígitos";
    }
    return "";
};

const validarCampo = (name, valor) => {
    switch (name) {
        case "nombre":
            return validarNombreApellido(valor, "nombre");
        case "apellido":
            return validarNombreApellido(valor, "apellido");
        case "email":
            return validarEmail(valor);
        case "password":
            return validarPassword(valor);
        case "telefono":
            return validarTelefono(valor);
        default:
            return "";
    }
};

// ---------- Componente ----------

function Register() {
    const navigate = useNavigate();

    const [datos, setDatos] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        telefono: "",
    });
    const [errores, setErrores] = useState({});
    const [errorServidor, setErrorServidor] = useState("");
    const [enviando, setEnviando] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatos({ ...datos, [name]: value });

        // Si el campo ya tenía un error, se revalida mientras escribe para que desaparezca solo
        if (errores[name]) {
            setErrores({ ...errores, [name]: validarCampo(name, value) });
        }
    };

    // Al salir de un campo se valida
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setErrores({ ...errores, [name]: validarCampo(name, value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorServidor("");

        // 1) Validación en el navegador
        const nuevosErrores = {};
        CAMPOS.forEach(({ name }) => {
            const mensaje = validarCampo(name, datos[name]);
            if (mensaje) nuevosErrores[name] = mensaje;
        });

        setErrores(nuevosErrores);

        const primerError = CAMPOS.find(({ name }) => nuevosErrores[name]);
        if (primerError) {
            document.getElementById(primerError.name)?.focus();
            return;
        }

        // 2) Envío al backend
        setEnviando(true);

        try {
            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: datos.nombre.trim(),
                    apellido: datos.apellido.trim(),
                    email: datos.email.trim().toLowerCase(),
                    password: datos.password,
                    telefono: datos.telefono.trim(),
                }),
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                // Errores por campo que mandó el backend (validación o email repetido)
                if (resultado.errores?.length > 0) {
                    const erroresServidor = {};
                    resultado.errores.forEach(({ campo, mensaje }) => {
                        erroresServidor[campo] = mensaje;
                    });
                    setErrores(erroresServidor);
                    document.getElementById(resultado.errores[0].campo)?.focus();
                } else {
                    setErrorServidor(resultado.mensaje || "No se pudo completar el registro");
                }
                return;
            }

            // 3) Usuario guardado: se va a la página principal
            // 3) Usuario guardado: se avisa y se va a la página principal
            alert("¡Usuario registrado correctamente!");

            navigate("/", { replace: true });
        } catch (error) {
            console.error("Error al registrar el usuario:", error);
            setErrorServidor(
                "No se pudo conectar con el servidor. Probá de nuevo en unos minutos.",
            );
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="login">
            <div className="login-card">
                <h1 className="login-titulo">Crear cuenta</h1>

                {errorServidor && (
                    <p className="register-alerta" role="alert">
                        {errorServidor}
                    </p>
                )}

                {/* noValidate: así se muestran nuestros mensajes y no los del navegador */}
                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {CAMPOS.map((campo) => (
                        <div key={campo.name} className="register-grupo">
                            <label className="login-label" htmlFor={campo.name}>
                                {campo.label}
                            </label>

                            <input
                                id={campo.name}
                                type={campo.type}
                                name={campo.name}
                                value={datos[campo.name]}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={campo.placeholder}
                                autoComplete={campo.autoComplete}
                                maxLength={campo.maxLength}
                                aria-invalid={Boolean(errores[campo.name])}
                                aria-describedby={
                                    errores[campo.name] ? `${campo.name}-error` : undefined
                                }
                                className={`login-campo${errores[campo.name] ? " campo-invalido" : ""}`}
                            />

                            {errores[campo.name] ? (
                                <p
                                    id={`${campo.name}-error`}
                                    className="register-error"
                                    role="alert"
                                >
                                    {errores[campo.name]}
                                </p>
                            ) : (
                                campo.ayuda && <p className="register-ayuda">{campo.ayuda}</p>
                            )}
                        </div>
                    ))}

                    <button type="submit" className="login-boton" disabled={enviando}>
                        {enviando ? "Registrando..." : "Registrarse"}
                    </button>
                </form>

                <Link to="/login" className="login-registro">
                    ¿Ya tenés cuenta? Iniciá sesión
                </Link>
            </div>
        </div>
    );
}

export default Register;
