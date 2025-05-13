// src/components/Inicio/Inicio.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Carrusel from "./Carrusel";
import WeatherWidget from "./WeatherWidget";

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
        <Carrusel />
        <WeatherWidget />
      </div>
    </div>
  );
};

export default Inicio;
