import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Inicio from "./components/Inicio/Inicio";
import CampoCRUD from "./components/campos/campos";
import VerCampos from "./components/campos/ver_campos";
import VerUsuarios from "./components/Usuarios/VerUsuarios";
import FormularioUsuario from "./components/Usuarios/FormularioUsuario";
import Sidebar from "./components/Inicio/Sidebar";

function App() {
  const location = useLocation();
  const hideSidebarPaths = ["/login", "/"]; // rutas donde NO debe mostrarse el sidebar
  const isSidebarVisible = !hideSidebarPaths.includes(location.pathname);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {isSidebarVisible && <Sidebar />}
      <div
        className="flex-grow-1"
        style={{
          overflowY: "auto",
          marginLeft: isSidebarVisible ? "250px" : "0px",
          padding: "1.5rem",
          width: "100%",
          backgroundColor: "#fff",
        }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/usuarios" element={<VerUsuarios />} />
          <Route path="/campos" element={<CampoCRUD />} />
          <Route path="/usuarios/nuevo" element={<FormularioUsuario />} />
          <Route path="/ver-campos" element={<VerCampos />} />
          <Route path="/usuarios/editar/:id" element={<FormularioUsuario />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
