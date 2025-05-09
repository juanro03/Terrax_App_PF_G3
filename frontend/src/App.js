// App.js
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Inicio/Sidebar";
import UserCrud from "./components/Usuarios/UserCrud";
import CampoCRUD from "./components/campos/campos";
import VerCampos from "./components/campos/ver_campos";
import Login from "./components/Auth/Login";
import PrivateRoute from "./components/Auth/PrivateRoute";
import "./components/campos/styles.css";

function App() {
  const location = useLocation();
  const hideSidebarRoutes = ["/login"];

  return (
    <div className="d-flex">
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
      <div
        className="flex-grow-1 p-4 bg-white"
        style={{ height: "100vh", overflowY: "auto" }}
      >
        <Routes location={location}>
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
        </Routes>
      </div>
    </div>
  );
}

export default App;
