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
const TEXTO = "#000000ff";
const GRID = "#dddddd";

function getUserRolFromToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.rol || null; // 👈 acá viene el 'admin' o 'productor'
  } catch (e) {
    console.error("Error decodificando token JWT:", e);
    return null;
  }
}

const Inicio = () => {
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();
  if (!token) {
    window.location.href = "/";
    return null;
  }

  const userRol = getUserRolFromToken();


  return (
    <div className="inicio-wrapper">
      {/* HERO */}
      <section className="mb-5" style={{ color: TEXTO }}>
        <Container fluid>
          <Row className="justify-content-center">
            <Col lg={10}>
              {/*<GeoConsentBanner />*/}
              <div >
                <h1 className="display-4" style={{ color: TEXTO }}>Bienvenido a Terrax</h1>
                <p className="lead" style={{ color: TEXTO }}>
                  Gestiona tus lotes agrícolas, monitorea índices y planifica tu
                  producción en un solo lugar.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {userRol === "productor" && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => navigate("/VerCampos")}
                    >
                      Mis Campos
                    </Button>
                  )}

                  <Button
                    variant="Usuarios"
                    size="lg"
                    onClick={() => navigate("/usuarios")}
                  >
                    Usuarios
                  </Button>

                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => navigate("/reportes")}
                  >
                    Reportes
                  </Button>
                  
                  {userRol === "productor" && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => navigate("/calendario")}
                    >
                      Calendario
                    </Button>
                  )}
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => navigate("/calculadora")}
                  >
                    Calculadora
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CARRUSEL */}
      <Container fluid className="px-0 mb-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="carrusel-redondeado">
              <Carrusel />
            </div>
          </Col>
        </Row>
      </Container>

      {/* PRECIOS DE GRANOS (NUEVA SECCIÓN) */}
      <Container fluid className="precios-granos-container px-0 mb-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="widget widget-auto">
              <PreciosGranos />
            </div>
          </Col>
        </Row>
      </Container>

      {/* SECCIÓN DE WIDGETS (CLIMA + DÓLAR) */}
      <Container fluid className="px-0 mb-4" >
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
