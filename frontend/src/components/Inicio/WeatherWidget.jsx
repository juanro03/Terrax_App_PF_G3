// src/components/Inicio/WeatherWidget.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Row, Col } from "react-bootstrap";

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
      <Card className="h-100 shadow-sm">
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <span>Cargando clima...</span>
        </Card.Body>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <span>Error al cargar el clima.</span>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title className="mb-5">
          Clima en {weather.name}
        </Card.Title>

        <Row className="text-center">
          {/* Temperatura */}
          <Col md={4} xs={12} className="mb-3">
            <div style={{ fontSize: "3rem" }}>🌡️</div>
            <div className="fw-bold" style={{ fontSize: "2rem" }}>
              {weather.main.temp}°C
            </div>
            <div>Temperatura</div>
          </Col>

          {/* Humedad */}
          <Col md={4} xs={12} className="mb-3">
            <div style={{ fontSize: "3rem" }}>💧</div>
            <div className="fw-bold" style={{ fontSize: "2rem" }}>
              {weather.main.humidity}%
            </div>
            <div>Humedad</div>
          </Col>

          {/* Viento */}
          <Col md={4} xs={12} className="mb-3">
            <div style={{ fontSize: "3rem" }}>🌬️</div>
            <div className="fw-bold" style={{ fontSize: "2rem" }}>
              {weather.wind.speed} m/s
            </div>
            <div>Viento</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default WeatherWidget;
