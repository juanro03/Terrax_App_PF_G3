import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Inicio from "./components/Inicio/Inicio";
import VerCampos from "./components/campos/VerCampos";
import VerUsuarios from "./components/Usuarios/VerUsuarios";
import Sidebar from "./components/Inicio/Sidebar";
import AdminRoute from "./components/Auth/AdminRoute";
import Perfil from "./components/Usuarios/Perfil";

function App() {
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
          <Route path="/VerCampos" element={<VerCampos />} />
          <Route path="/perfil" element={<Perfil />} />
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

export default App;
