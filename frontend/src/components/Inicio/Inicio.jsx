// src/components/Inicio/Inicio.jsx
import React from "react";
import Carrusel from "./Carrusel";
import WeatherWidget from "./WeatherWidget";
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
      <div className="flex-grow-1 p-4">
        <h1>Bienvenido a Terrax</h1>
        <Carrusel />
        <WeatherWidget />
      </div>
    </div>
  );
};

export default Inicio;
