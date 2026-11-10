import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import PaginaMapa from "./Pages/PaginaMapa";
import Home from "./pages/Home";
import SideBar from "./components/SideBar";
import Reporte from "./Components/Reporte";
import Denuncia from "./pages/Denuncia";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardReportes from "./pages/DashboardReportes";

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
        <Route path="reportes" element={<DashboardReportes/>} />
        <Route path="mapa" element={<PaginaMapa />} />
        
      </Route>  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
