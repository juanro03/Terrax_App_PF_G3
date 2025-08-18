// src/components/Inicio/WeatherWidget.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Row, Col } from "react-bootstrap";
import { ThermometerIcon, DropletIcon, WindIcon, SunIcon } from "lucide-react";

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

  if (loading) {
    return (
      <Card className="h-100 shadow-sm p-4 d-flex justify-content-center align-items-center" style={{ minHeight: "260px" }}>
        <span>Cargando clima...</span>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="h-100 shadow-sm p-4 d-flex justify-content-center align-items-center" style={{ minHeight: "260px" }}>
        <span>Error al cargar el clima.</span>
      </Card>
    );
  }

  return (
    <Card className="h-100 shadow-sm p-4" style={{ minHeight: "260px", backgroundColor: "var(--verde-claro)" }}>
      <div className="mb-3 d-flex align-items-center">
        <SunIcon className="me-2" size={22} color="#198754" />
        <h5 className="mb-0" style={{ color: "#198754" }}>Tiempo</h5>
      </div>

      <div className="text-center mb-4">
        <div style={{ fontSize: "3.5rem", fontWeight: 500, color: "#333" }}>
          {Math.round(weather.main.temp)}°C
        </div>
        <div className="text-muted">
          {weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)}
        </div>
      </div>

      <Row className="text-start" style={{ fontSize: "0.95rem" }}>
        <Col xs={6} className="d-flex align-items-center mb-2">
          <ThermometerIcon size={18} className="me-2" />
          <strong>Temp. máx:</strong>&nbsp; {Math.round(weather.main.temp_max)}°C
        </Col>
        <Col xs={6} className="d-flex align-items-center mb-2">
          <ThermometerIcon size={18} className="me-2" />
          <strong>Temp. mín:</strong>&nbsp; {Math.round(weather.main.temp_min)}°C
        </Col>
        <Col xs={6} className="d-flex align-items-center mb-2">
          <DropletIcon size={18} className="me-2" />
          <strong>Humedad:</strong>&nbsp; {weather.main.humidity}%
        </Col>
        <Col xs={6} className="d-flex align-items-center mb-2">
          <WindIcon size={18} className="me-2" />
          <strong>Viento:</strong>&nbsp; {weather.wind.speed} m/s
        </Col>
      </Row>
    </Card>
  );
};

export default WeatherWidget;
