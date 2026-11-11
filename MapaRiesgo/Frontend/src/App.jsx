import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import PaginaMapa from "./Pages/PaginaMapa";
import Home from "./pages/Home";
import SideBar from "./components/SideBar";
import Reporte from "./Components/Reporte";
import Denuncia from "./pages/Denuncia";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardReportes from "./pages/DashboardReportes";
import Layout from "./components/Layout";
import IniciarSesion from "./pages/Login";
import Registrarse from "./pages/RegisterP";
import Usuarios from "./pages/Usuarios";
import RutaPrivada from "./components/RutaPrivada";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<IniciarSesion />} />
        <Route path="/register" element={<Registrarse />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mapa" element={<PaginaMapa />} />
          <Route path="/reporte" element={<Reporte />} />
          <Route path="/denuncia" element={<Denuncia />} />
        </Route>

        <Route element={<RutaPrivada soloAdmin={true} />}>
          <Route path="/admin" element={<SideBar />}>
            <Route index element={<DashboardAdmin />} />
            <Route path="reportes" element={<DashboardReportes />} />
            <Route path="mapa" element={<PaginaMapa />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
