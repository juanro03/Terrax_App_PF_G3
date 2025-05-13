import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Inicio/Sidebar";
import UserCrud from "./components/Usuarios/UserCrud";
import VerUsuarios from "./components/Usuarios/VerUsuarios";
import FormularioUsuario from "./components/Usuarios/FormularioUsuario";

function App() {
  const location = useLocation();

  return (
    <div className="d-flex">
      <Sidebar />
      <div
        className="flex-grow-1 p-4 bg-white"
        style={{ height: "100vh", overflowY: "auto" }}
      >
        <Routes location={location}>
          <Route path="/usuarios" element={<VerUsuarios />} />
          <Route path="/usuarios/nuevo" element={<FormularioUsuario />} />
          <Route path="/usuarios/editar/:id" element={<FormularioUsuario />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
