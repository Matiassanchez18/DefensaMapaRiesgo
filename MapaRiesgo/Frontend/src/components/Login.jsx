import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Login.css";
import useAuthStore from "../store/Store";

function Login() {
  const [datos, setDatos] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    
    try {
      const respuesta = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });
      const data = await respuesta.json();
      if (!respuesta.ok) {
        setError(data.mensaje);
        return;
    }
    login(data.usuario);
    navigate("/");
  } catch {
setError("Error al conectar con el servidor.");
  } finally {
    setCargando(false);
  }
  }

  
  return (
    <div className="login">
      <div className="login-card">
        <h1 className="login-titulo">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={datos.email}
            onChange={handleChange}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            required
            className="login-campo"
          />

          <label className="login-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={datos.password}
            onChange={handleChange}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            required
            className="login-campo"
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-boton" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <Link to="/register" className="login-registro">
          Registrarse
        </Link>
      </div>
    </div>
  );
}

export default Login;