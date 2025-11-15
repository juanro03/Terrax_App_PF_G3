import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Inicio from "./components/Inicio/Inicio";
import VerCampos from "./components/campos/VerCampos";
import VerLotes from "./components/lotes/VerLotes";
import Calendario from "./components/Calendario/Calendario";
import VerUsuarios from "./components/Usuarios/VerUsuarios";
import Sidebar from "./components/Inicio/Sidebar";
import AdminRoute from "./components/Auth/AdminRoute";
import Perfil from "./components/Usuarios/Perfil";
import Calculadora from "./components/Calculadora/Calculadora";
import ProductosInicio from "./components/Productos/ProductosInicio";
import ProductosLista from "./components/Productos/ProductosLista";
import ProductoForm from "./components/Productos/ProductosForm";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import VerLotesWrapper from "./components/lotes/VerLotesWrapper";
import ResetPassword from "./components/Auth/ResetPassword";
import DetalleLote from "./components/DetalleLote/DetalleLote";
import ProductosForm from "./components/Productos/ProductosForm";
import Reportes from "./components/Reportes/reportes.jsx";
import HistorialCampanias from "./components/DetalleLote/HistorialCampanias";
import TareasAgricolas from "./components/TareasAgricolas/TareasAgricolas";
import TrazabilidadEmbed from "./components/TareasAgricolas/TrazabilidadEmbed";


function AppContent() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const hideSidebarPaths = ["/login", "/"];
  const isSidebarVisible = !hideSidebarPaths.includes(location.pathname);

  const contentMarginLeft = !isSidebarVisible
    ? "0px"
    : sidebarOpen
    ? "250px"
    : "70px";

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {isSidebarVisible && (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}

      <div
        className="flex-grow-1"
        style={{
          marginLeft: contentMarginLeft,
          width: "100%",
          backgroundColor: "#effeee",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/tareas" element={<TareasAgricolas />} />
          <Route path="/vercampos" element={<VerCampos />} />
          <Route path="/campos/:campoId/lotes" element={<VerLotesWrapper />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/lote/:loteId" element={<DetalleLote />} />
          <Route path="/productos" element={<ProductosInicio />} />
          <Route path="/productos/agregar" element={<ProductosForm />} />
          <Route path="/productos/ver" element={<ProductosLista />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/tareas/trazabilidad" element={<TrazabilidadEmbed />} />
          <Route path="/lotes/:loteId/historial" element={<HistorialCampanias />} />


          <Route
            path="/usuarios"
            element={
              <AdminRoute>
                <VerUsuarios />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
