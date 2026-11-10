
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import PaginaMapa from "./Pages/PaginaMapa";
import Home from "./Pages/Home";
import Reporte from "./Components/Reporte";
import Denuncias from "./Pages/Denuncia";
import Layout from "./components/Layout";
import IniciarSesion from "./pages/Login";
import Registrarse from "./pages/RegisterP";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<IniciarSesion />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mapa" element={<PaginaMapa />} />
          <Route path="/reporte" element={<Reporte />} />
          <Route path="/denuncia" element={<Denuncias />} />
          <Route path="/register" element={<Registrarse />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
