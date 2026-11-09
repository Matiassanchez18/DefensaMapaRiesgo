import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import PaginaMapa from "./Pages/PaginaMapa";
import Home from "./pages/Home";
import Reporte from "./Components/Reporte";
import Denuncias from "./pages/Denuncia";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa" element={<PaginaMapa />} />
        <Route path="/reporte" element={<Reporte />} />
        <Route path="/denuncia" element={<Denuncias />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
