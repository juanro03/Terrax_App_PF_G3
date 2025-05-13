// src/components/WeatherWidget.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_KEY = "5fc1ccb78198466fe73df5dc9bba05aa"; // Reemplazá con tu clave de API
  const CITY = "Cordoba,AR"; // Podés cambiar la ciudad según tu ubicación

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=es`
        );
        setWeather(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener los datos del clima:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <p>Cargando clima...</p>;
  if (error) return <p>Error al cargar el clima.</p>;

  return (
    <div
      className="card"
      style={{
        marginTop: "1.5rem",
        width: "100%",
        backgroundColor: "#f5f5f5",
        border: "none",
        borderRadius: "0.75rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className="card-header fw-bold"
        style={{
          backgroundColor: "transparent",
          borderBottom: "none",
          fontSize: "1.25rem",
        }}
      >
        Clima en {weather.name}
      </div>
      <div className="card-body d-flex align-items-center">
        <div>
          <h5 className="card-title text-capitalize mb-2">
            {weather.weather[0].description}
          </h5>
          <p className="card-text mb-1">🌡️ {weather.main.temp}°C</p>
          <p className="card-text mb-1">💧 {weather.main.humidity}% humedad</p>
          <p className="card-text">🌬️ {weather.wind.speed} m/s viento</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
