import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/Store";

function RutaPrivada({ soloAdmin = false }) {
  const inicioSesion = useAuthStore((state) => state.inicioSesion);
  const usuario = useAuthStore((state) => state.usuario);

  if (!inicioSesion || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && usuario.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RutaPrivada;