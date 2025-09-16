// src/components/Inicio/Inicio.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Carrusel from "./Carrusel";
import WeatherWidget from "./WeatherWidget";
import DolarWidget from "./DolarWidget";
import PreciosGranos from "./PreciosGranos";
import GeoConsentBanner from "../common/GeoConsentBanner";

import { Container, Row, Col, Button, Card } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./Inicio.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const VERDE = "#198754";
const VERDE_OSCURO = "#155a36";
const TEXTO = "#333333";
const GRID = "#dddddd";

const Inicio = () => {
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();
  if (!token) {
    window.location.href = "/";
    return null;
  }

  const ndviData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
    datasets: [
      {
        label: "Índice NDVI Promedio",
        data: [0.45, 0.52, 0.61, 0.57, 0.49],
        borderColor: VERDE,
        backgroundColor: "rgba(25,135,84,.15)",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const ndviOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Evolución NDVI (últimos 5 meses)",
        color: TEXTO,
        font: { weight: 600, size: 16 },
      },
      legend: { labels: { color: TEXTO, font: { size: 12 } } },
      tooltip: { intersect: false, mode: "index" },
    },
    scales: {
      x: { ticks: { color: TEXTO }, grid: { color: GRID } },
      y: { ticks: { color: TEXTO }, grid: { color: GRID } },
    },
  };

  return (
    <div className="inicio-wrapper">
      {/* Sólo estilos/ajustes, sin cambiar posiciones */}
      <style>{`
        /* Botón verde cuadrado */
        .inicio-wrapper .btn-terrax{
          background:${VERDE}!important;color:#fff!important;border:1px solid ${VERDE}!important;
          font-weight:700!important;border-radius:10px!important;padding:10px 16px!important;line-height:1.2!important;
        }
        .inicio-wrapper .btn-terrax:hover{background:${VERDE_OSCURO}!important;border-color:${VERDE_OSCURO}!important}

        /* Tarjetas: misma estética y alturas mínimas */
        .inicio-wrapper .card-shadow-sm{box-shadow:0 4px 14px rgba(0,0,0,.06)!important;border:1px solid rgba(25,135,84,.12)!important;border-radius:16px!important;background:#fff!important}
        .inicio-wrapper .dash-equal .card{min-height:260px!important}
        /* Si algún widget trae min-height/height agresivo, lo normalizamos dentro del col marcado como .dash-fix */
        .inicio-wrapper .dash-fix *{min-height:initial!important;height:auto!important}

        /* Evitar que css globales pisen el grid */
        .inicio-wrapper .container,.inicio-wrapper .row,.inicio-wrapper .col{position:relative}
      `}</style>

      {/* HERO */}
      <section style={{ color: TEXTO, padding: "3rem 0" }}>
        <Container fluid className="px-0">
          <Row className="justify-content-center">
            <Col lg={10}>
              <GeoConsentBanner />
              <div className="px-3 px-md-4 px-lg-5">
                <h1 className="display-4" style={{ letterSpacing: ".2px" }}>
                  Bienvenido a Terrax
                </h1>
                <p className="lead" style={{ letterSpacing: ".2px" }}>
                  Gestiona tus lotes agrícolas, monitorea índices y planifica tu
                  producción en un solo lugar.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    className="btn-terrax"
                    size="lg"
                    onClick={() => navigate("/VerCampos")}
                  >
                    Ver Mis Campos
                  </Button>
                  <Button
                    className="btn-terrax"
                    size="lg"
                    onClick={() => navigate("/calculadora")}
                  >
                    Ver Calculadora
                  </Button>
                  <Button
                    className="btn-terrax"
                    size="lg"
                    onClick={() => navigate("/reportes")}
                  >
                    Ver Mis Reportes
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CARRUSEL */}
      <Container fluid className="px-0">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Carrusel />
          </Col>
        </Row>
      </Container>

      {/* WIDGETS — Mismo orden que tenías: Weather, Dólar, Precios, NDVI */}
      <Container style={{ padding: "2rem 0" }}>
        <Row className="g-4 justify-content-center dash-equal">
          <Col md={6} className="dash-fix">
            <WeatherWidget />
          </Col>
          <Col md={4} className="dash-fix">
            <DolarWidget />
          </Col>
          <Col md={4} className="dash-fix">
            <PreciosGranos />
          </Col>
          <Col md={6}>
            <Card className="card-shadow-sm">
              <Card.Body>
                <Line options={ndviOptions} data={ndviData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* FOOTER */}
      <footer style={{ padding: "1.5rem 0" }}>
        <Container className="text-center text-muted">
          © 2025 Terrax. Todos los derechos reservados.
        </Container>
      </footer>
    </div>
  );
};

export default Inicio;
