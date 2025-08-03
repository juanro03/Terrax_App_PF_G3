import React, { useState } from "react";
import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const colors = {
  primary: "#198754",
  bg: "#e9fbe5",
  sectionBg: "#f0f8f3",
  border: "#c9eace",
};

const camposFake = [
  { id: 1, nombre: "Campo Norte" },
  { id: 2, nombre: "Campo Sur" },
];
const lotesFake = [
  { id: 1, campoId: 1, nombre: "Lote 1" },
  { id: 2, campoId: 1, nombre: "Lote 2" },
  { id: 3, campoId: 2, nombre: "Lote 3" },
];
const actividades = [
  "Fertilización",
  "Manejo de suelo",
  "Riego",
  "Pulverización",
  "Aplicación Fitosanitaria",
];

export default function TareasAgricolas() {
  const [campo, setCampo] = useState("");
  const [lote, setLote] = useState("");
  const [actividad, setActividad] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `📋 Tarea cargada:\nCampo: ${campo}\nLote: ${lote}\nActividad: ${actividad}`
    );
  };

  return (
    <Container
      fluid
      style={{
        background: colors.bg,
        minHeight: "100vh",
        padding: "2rem 1rem",
      }}
    >
      <Card
        className="mx-auto shadow-sm"
        style={{
          maxWidth: "1400px",
          borderRadius: "1 rem",
          background: colors.sectionBg,
          border: `1px solid ${colors.border}`,
        }}
      >
        <Card.Header
          style={{
            background: "transparent",
            borderBottom: "none",
            padding: "1.5rem 2rem",
          }}
        >
          <Row className="align-items-center">
            <Col>
              <h3 style={{ color: colors.primary, fontWeight: 700, margin: 0 }}>
                Registrar Tarea Agrícola
              </h3>
            </Col>
            <Col className="text-end">
              <Button variant="outline-success" size="sm">
                Historial
              </Button>
              <Button variant="outline-success" size="sm" className="ms-2">
                Reportes
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body style={{ padding: "2rem" }}>
          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Form.Group as={Col} md={4} xs={12}>
                <Form.Label className="fw-bold text-dark">
                  <i style={{ color: colors.primary }} />
                  Campo
                </Form.Label>
                <Form.Select
                  value={campo}
                  onChange={(e) => {
                    setCampo(e.target.value);
                    setLote("");
                  }}
                  required
                  className="shadow-sm"
                  style={{
                    borderRadius: "0.8rem",
                    borderColor: colors.primary,
                    height: "45px",
                  }}
                >
                  <option value="">Seleccione campo</option>
                  {camposFake.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md={4} xs={12}>
                <Form.Label className="fw-bold text-dark">
                  <i style={{ color: colors.primary }} />
                  Lote
                </Form.Label>
                <Form.Select
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                  disabled={!campo}
                  required
                  style={{
                    borderRadius: "0.8rem",
                    borderColor: colors.primary,
                    height: "45px",
                  }}
                >
                  <option value="">Seleccione lote</option>
                  {lotesFake
                    .filter((l) => l.campoId === Number(campo))
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nombre}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md={4} xs={12}>
                <Form.Label className="fw-bold text-dark">
                  <i style={{ color: colors.primary }} />
                  Actividad
                </Form.Label>
                <Form.Select
                  value={actividad}
                  onChange={(e) => setActividad(e.target.value)}
                  required
                  className="shadow-sm"
                  style={{
                    borderRadius: "0.8rem",
                    borderColor: colors.primary,
                    height: "45px",
                  }}
                >
                  <option value="">Seleccione tarea agrícola</option>
                  {actividades.map((a, i) => (
                    <option key={i} value={a}>
                      {a}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                type="submit"
                variant="success"
                className="fw-bold py-2 px-4 shadow-sm"
                style={{ borderRadius: "0.8rem", minWidth: "150px" }}
              >
                Registrar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
