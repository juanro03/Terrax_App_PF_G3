// App.js
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Inicio/Sidebar";
import UserCrud from "./components/Usuarios/UserCrud";

function App() {
  const location = useLocation();

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-white" style={{ height: "100vh", overflowY: "auto" }}>
        <Routes location={location}>
          <Route path="/usuarios" element={<UserCrud />} />
          <Route path="/" element={<div />} />
          {/* otras rutas */}
        </Routes>
      </div>
    </div>
  );
}

export default App;

