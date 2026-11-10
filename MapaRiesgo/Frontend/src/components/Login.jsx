import { useState } from "react";
import { Link } from "react-router-dom";
import "../style/Login.css";

function Login() {
  const [datos, setDatos] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(datos); // el backend va después (historia #10)
  };

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

          <button type="submit" className="login-boton">
            Ingresar
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