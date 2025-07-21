// src/components/Inicio/Inicio.jsx
import React from "react";
import Carrusel from "./Carrusel";
import WeatherWidget from "./WeatherWidget";



import { Container, Row, Col, Button, Card, Accordion } from "react-bootstrap";
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


// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const Inicio = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "/";
    return null;
  }




  return (
    <div style={{ backgroundColor: "transparent", minHeight: "100vh" }}>
      {/* 1) Hero / Cabecera */}
      <section
        style={{
          color: "#333333",
          padding: "3rem 0",
        }}
      >
        <Container className="ps-5">
          <h1 className="display-4 fuente-bonita">Bienvenido a Terrax</h1>
          <p className="lead fuente-bonita">
            Gestiona tus lotes agrícolas, monitorea índices y planifica tu
            producción en un solo lugar.
          </p>
          <Button variant="success" size="lg" href="/VerCampos">
            Ver Mis Campos
          </Button>
        </Container>
      </section>

      {/* 2) Carrusel */}
      <Container fluid className="ps-2">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Carrusel />
          </Col>
        </Row>
      </Container>

      {/* 3) Widgets y Tarjetas informativas */}
      <Container style={{ padding: "2rem 0" }}>
        <Row className="g-4">
          {/* 3.1) WeatherWidget */}
          <Col md={6}>
            <WeatherWidget />
          </Col>

        


          {/* 3.3) Tarjetas rápidas (Mis Campos, Calendario, Reportes) */}
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="text-dark">Mis Campos</Card.Title>
                <Card.Text className="text-dark">
                  Registra, edita y visualiza tus lotes agrícolas.
                </Card.Text>
                <Button variant="outline-success" href="/VerCampos">
                  Acceder
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="text-dark">Calendario</Card.Title>
                <Card.Text className="text-dark">
                  Planifica tus tareas y recibe recordatorios.
                </Card.Text>
                <Button variant="outline-success" href="/calendario">
                  Ver Calendario
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="text-dark">Reportes</Card.Title>
                <Card.Text className="text-dark">
                  Genera informes y exporta datos de producción.
                </Card.Text>
                <Button variant="outline-success" href="/reportes">
                  Ver Reportes
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* 3.4) Sección de novedades con Accordion */}
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Header style={{ backgroundColor: "#ffffff" }}>
                <h5 className="mb-0 text-dark">Novedades</h5>
              </Card.Header>
              <Card.Body>
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      Funcionalidad de Mapeo NDVI
                    </Accordion.Header>
                    <Accordion.Body>
                      Ahora Terrax permite cargar imágenes multiespectrales para
                      generar mapas NDVI detallados y tomar decisiones precisas.
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>
                      Nuevo Módulo de Pronóstico
                    </Accordion.Header>
                    <Accordion.Body>
                      Hemos integrado el pronóstico del clima a 7 días para
                      optimizar tu planificación. Verás alertas meteorológicas
                      directamente en el calendario.
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="2">
                    <Accordion.Header>Exportación de Reportes</Accordion.Header>
                    <Accordion.Body>
                      Ahora puedes exportar tus reportes a PDF y CSV con un solo
                      clic. Ideal para presentaciones y análisis externos.
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* 4) Footer */}
      <footer style={{ padding: "1.5rem 0" }}>
        <Container className="text-center text-muted">
          © 2025 Terrax. Todos los derechos reservados.
        </Container>
      </footer>
    </div>
  );
};

export default Inicio;
