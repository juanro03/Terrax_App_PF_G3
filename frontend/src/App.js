// App.js
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Inicio/Sidebar";
import UserCrud from "./components/Usuarios/UserCrud";
import CampoCRUD from "./components/campos/campos";
import './components/campos/styles.css';
import VerCampos from "./components/campos/ver_campos";



function App() {
  const location = useLocation();

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-white" style={{ height: "100vh", overflowY: "auto" }}>
        <Routes location={location}>
          <Route path="/usuarios" element={<UserCrud />} />
          <Route path="/campos" element={<CampoCRUD/>} />
          <Route path="/" element={<div />} />
          <Route path="/ver-campos" element={<VerCampos />} />
          {/* otras rutas */}
        </Routes>
      </div>
    </div>
  );
}

export default App;

