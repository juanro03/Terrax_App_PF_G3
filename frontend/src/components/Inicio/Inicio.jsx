// src/components/Inicio/Inicio.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Carrusel from "./Carrusel";
import Clima from "./Clima";
import CotizacionDolar from "./CotizacionDolar";
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

  return (
    <div className="inicio-wrapper">
      {/* HERO */}
      <section style={{ color: TEXTO, padding: "3rem 0" }}>
        <Container fluid>
          <Row className="justify-content-center">
            <Col lg={10}>
              <GeoConsentBanner />
              <div >
                <h1 className="display-4">Bienvenido a Terrax</h1>
                <p className="lead">
                  Gestiona tus lotes agrícolas, monitorea índices y planifica tu
                  producción en un solo lugar.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => navigate("/VerCampos")}
                  >
                    Mis Campos
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => navigate("/reportes")}
                  >
                    Mis Reportes
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => navigate("/calendario")}
                  >
                    Calendario
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
            <div className="carrusel-redondeado">
              <Carrusel />
            </div>
          </Col>
        </Row>
      </Container>

      {/* PRECIOS DE GRANOS (NUEVA SECCIÓN) */}
      <Container fluid className="precios-granos-container px-0">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="widget widget-auto no-padding">
              <PreciosGranos />
            </div>
          </Col>
        </Row>
      </Container>

      {/* SECCIÓN DE WIDGETS (CLIMA + DÓLAR) */}
      <Container fluid className="px-0" >
        <Row className="justify-content-center">
          <Col lg={10}>
            <Row className="widgets-eq">
              {/* Columna izquierda: CLIMA (ocupa la mitad) */}
              <Col md={8}>
                <div className="widget">
                  <Clima />
                </div>
              </Col>

              {/* Columna derecha: SOLO DÓLAR */}
              <Col md={4}>
                <div className="widget">
                  <CotizacionDolar />
                </div>
              </Col>
            </Row>
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
