import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import PaginaMapa from "./Pages/PaginaMapa";
import Home from "./pages/Home";
import SideBar from "./components/SideBar";
import Reporte from "./Components/Reporte";
import Denuncia from "./pages/Denuncia";
import DashboardAdmin from "./pages/DashboardAdmin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa" element={<PaginaMapa />} />
        <Route path="/reporte" element={<Reporte />} />
        <Route path="/denuncia" element={<Denuncia />} />
    

      {/* ---temporal */}

      <Route path="/admin" element={<SideBar />}>
        <Route index element={<DashboardAdmin/>} />
        <Route path="reportes" element={<Denuncia/>} />
        <Route path="mapa" element={<PaginaMapa />} />
        {/* <Route path="zonas" element={<h1>Zonas</h1>} />
        <Route path="usuarios" element={<h1>Usuarios</h1>} /> */}
      </Route>  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
