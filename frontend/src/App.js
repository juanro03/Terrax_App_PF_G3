import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Inicio from "./components/Inicio/Inicio";
import VerCampos from "./components/campos/VerCampos";
import VerLotes from "./components/lotes/VerLotes";
import VerUsuarios from "./components/Usuarios/VerUsuarios";
import Sidebar from "./components/Inicio/Sidebar";
import AdminRoute from "./components/Auth/AdminRoute";
import Perfil from "./components/Usuarios/Perfil";
import Calculadora from "./components/Calculadora/Calculadora";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw"; // importante
import VerLotesWrapper from "./components/lotes/VerLotesWrapper";


function AppContent() {
  const location = useLocation();
  const hideSidebarPaths = ["/login", "/"];
  const isSidebarVisible = !hideSidebarPaths.includes(location.pathname);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {isSidebarVisible && <Sidebar />}
      <div
        className="flex-grow-1"
        style={{
          overflowY: "auto",
          marginLeft: isSidebarVisible ? "250px" : "0px",
          width: "100%",
          backgroundColor: "#fff",
        }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/vercampos" element={<VerCampos />} />
          <Route path="/campos/:campoId/lotes" element={<VerLotesWrapper />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/calculadora" element={<Calculadora />} />
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

