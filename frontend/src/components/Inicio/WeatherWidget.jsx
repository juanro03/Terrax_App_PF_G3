import React, { useState, useEffect } from "react";
import axios from "axios";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_KEY = "5fc1ccb78198466fe73df5dc9bba05aa";
  const CITY = "Cordoba,AR";

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

  if (loading) return <p style={{ color: "#000" }}>Cargando clima...</p>;
  if (error) return <p style={{ color: "#000" }}>Error al cargar el clima.</p>;

  return (
    <div
      style={{
        marginTop: "1.5rem",
        width: "100%",
        backgroundColor: "#f5f5f5", // blanco
        color: "#000000",            // texto negro
        borderRadius: "0.75rem",
        padding: "1rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",

      }}
    >
      <div
        className="card-header fw-bold"
        style={{
          backgroundColor: "transparent",
          borderBottom: "none",
          fontSize: "1.25rem",
          marginBottom: "0.75rem",
        }}
      >
        Clima en {weather.name}
      </div>
      <div>
        <h5 className="text-capitalize ">
          {weather.weather[0].description}
        </h5>
        <p style={{ margin: 0, color: "#000" }}>🌡️ {weather.main.temp}°C</p>
        <p style={{ margin: 0, color: "#000" }}>💧 {weather.main.humidity}% humedad</p>
        <p style={{ margin: 0, color: "#000" }}>🌬️ {weather.wind.speed} m/s viento</p>
      </div>
    </div>
  );
};

export default WeatherWidget;
