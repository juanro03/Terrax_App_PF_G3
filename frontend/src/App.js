// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Inicio/Sidebar";
import UserCrud from "./components/Usuarios/UserCrud";
import CampoCRUD from "./components/campos/campos";
import VerCampos from "./components/campos/ver_campos";
<<<<<<< HEAD
=======
import Login from "./components/Auth/Login";
import PrivateRoute from "./components/Auth/PrivateRoute";
import "./components/campos/styles.css";
>>>>>>> 547557c (Creacion de rama iniciar sesion -- Frontend OK para iniciar sesión)

function App() {
  const location = useLocation();
  const hideSidebarRoutes = ["/login"];

  return (
    <div className="d-flex">
<<<<<<< HEAD
      <Sidebar />
=======
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
>>>>>>> 547557c (Creacion de rama iniciar sesion -- Frontend OK para iniciar sesión)
      <div
        className="flex-grow-1 p-4 bg-white"
        style={{ height: "100vh", overflowY: "auto" }}
      >
        <Routes location={location}>
<<<<<<< HEAD
          <Route path="/usuarios" element={<UserCrud />} />
          <Route path="/campos" element={<CampoCRUD />} />
          <Route path="/" element={<div />} />
          <Route path="/ver-campos" element={<VerCampos />} />
          {/* otras rutas */}
=======
          <Route path="/login" element={<Login />} />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <UserCrud />
              </PrivateRoute>
            }
          />
          <Route
            path="/campos"
            element={
              <PrivateRoute>
                <CampoCRUD />
              </PrivateRoute>
            }
          />
          <Route
            path="/ver-campos"
            element={
              <PrivateRoute>
                <VerCampos />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <UserCrud />
              </PrivateRoute>
            }
          />
>>>>>>> 547557c (Creacion de rama iniciar sesion -- Frontend OK para iniciar sesión)
        </Routes>
      </div>
    </div>
  );
}

export default App;
