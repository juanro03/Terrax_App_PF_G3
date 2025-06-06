// src/App.jsx
import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Login from "./components/Auth/Login";
import Inicio from "./components/Inicio/Inicio";
import VerCampos from "./components/campos/VerCampos";
import VerUsuarios from "./components/Usuarios/VerUsuarios";
import Sidebar from "./components/Inicio/Sidebar";
import AdminRoute from "./components/Auth/AdminRoute";
import Perfil from "./components/Usuarios/Perfil";
import Calculadora from "./components/Calculadora/Calculadora";

function App() {
  const location = useLocation();

  // 1) Definimos aquí el estado de si el sidebar está abierto o colapsado:
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 2) Rutas en las que NO queremos mostrar la barra lateral:
  const hideSidebarPaths = ["/login", "/"];
  const isSidebarVisible = !hideSidebarPaths.includes(location.pathname);

  // 3) Según isSidebarVisible y sidebarOpen, calculamos el margen izquierdo:
  //    - Si NO se muestra el sidebar, marginLeft = 0
  //    - Si se muestra y está abierto, marginLeft = 250px
  //    - Si se muestra y está colapsado, marginLeft = 70px
  const contentMarginLeft = !isSidebarVisible
    ? "0px"
    : sidebarOpen
    ? "250px"
    : "70px";

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {isSidebarVisible && (
        // 4) Le pasamos a Sidebar la prop `isOpen` y la función para cambiarla:
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}

      <div
        className="flex-grow-1"
        style={{
          overflowY: "auto",
          marginLeft: contentMarginLeft,
          width: "100%",
          backgroundColor: "#effeee",
        }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/VerCampos" element={<VerCampos />} />
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

export default App;
