// src/components/Inicio/Inicio.jsx
import React from "react";
import Sidebar from "./Sidebar";

const Inicio = () => {
  const token = localStorage.getItem("accessToken");

  // Redirige si no hay token
  if (!token) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="d-flex vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-4 bg-white">
        <h1>Bienvenido a Terrax</h1>
        <p>Este es tu panel de inicio.</p>
      </div>
    </div>
  );
};

export default Inicio;
