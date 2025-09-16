import React, { useState } from "react";
import axios from "axios";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// === PALETA / TOKENS
const verde = "#198754";
const verdeClaro = "#e9fbe5";
const verdeOscuro = "#155a36";
const grisClaro = "#f3f6f5";
const blanco = "#fff";
const grisOscuro = "#424242";

// Datos
const categorias = [
  { nombre: "COADYUVANTES" },
  { nombre: "FERTILIZANTES" },
  { nombre: "AGROQUIMICOS" },
  { nombre: "SEMILLAS" },
];

const opciones = {
  COADYUVANTES: [
    "TENSIOACTIVO",
    "ACEITE",
    "ANTIESPUMANTE",
    "AGENTE HUMECTANTE",
    "AGENTE ADHERENTE",
    "ACONDICIONADOR DE AGUA",
    "CORRECTOR DE PH",
    "CAPTURADOR DE CATIONES",
    "OTROS",
  ],
  FERTILIZANTES: [
    "NITROGENO",
    "FOSFORO",
    "POTASIO",
    "AZUFRE",
    "CALCIO",
    "MAGNESIO",
    "COMPLEJO (NPK)",
    "MATERIA ORGANICA",
    "OTROS",
  ],
  AGROQUIMICOS: [
    "HERBICIDA",
    "INSECTICIDA",
    "FUNGICIDA",
    "NEMATICIDA",
    "ACARICIDA",
    "RODENTICIDA",
    "BACTERICIDA",
    "OTROS",
  ],
  SEMILLAS: [
    "MAIZ",
    "TRIGO",
    "AVENA",
    "SORGO",
    "CEBADA",
    "SOJA",
    "GIRASOL",
    "ALGODON",
    "ARROZ",
    "CENTENO",
    "ALFALFA",
    "LINO",
    "CHÍA",
    "PAPA",
    "MANÍ",
    "TREBOL",
    "LENTEJA",
    "GARBANZO",
    "POROTO",
    "BATATA",
    "ALGODÓN",
    "VICIA",
    "MOHA",
    "ARROZ",
    "ARVEJA",
    "OTROS",
  ],
};

const ProductosForm = () => {
  const navigate = useNavigate();

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("COADYUVANTES");

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    cultivo: "",
    variedad: "",
    diasMadurez: "",
  });

  const [inputOtroTipo, setInputOtroTipo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "tipo" && value !== "OTROS") setInputOtroTipo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem("accessToken");

      const payload = {
        categoria: categoriaSeleccionada,
        nombre: formData.nombre?.trim() || null,
        tipo:
          formData.tipo === "OTROS" && inputOtroTipo.trim()
            ? inputOtroTipo.trim()
            : formData.tipo || null,
        cultivo: formData.cultivo?.trim() || null,
        variedad: formData.variedad?.trim() || null,
        dias_madurez: formData.diasMadurez?.trim() || null,
      };

      await axios.post("http://localhost:8000/api/productos/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Producto agregado con éxito");
      setFormData({
        nombre: "",
        tipo: "",
        cultivo: "",
        variedad: "",
        diasMadurez: "",
      });
      setInputOtroTipo("");
    } catch (error) {
      console.error(
        "Error al guardar producto:",
        error.response?.data || error
      );
      alert("Error al guardar producto. Revisá consola.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderInputs = () => {
    if (categoriaSeleccionada === "SEMILLAS") {
      return (
        <>
          <Col xs={12} md={6}>
            <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>
              Cultivo
            </Form.Label>
            <Form.Select
              name="cultivo"
              value={formData.cultivo}
              onChange={handleChange}
              required
              className="input-terrax w-100"
            >
              <option value="">Seleccione un cultivo</option>
              {opciones.SEMILLAS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} md={6}>
            <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>
              Variedad
            </Form.Label>
            <Form.Control
              name="variedad"
              value={formData.variedad}
              onChange={handleChange}
              required
              className="input-terrax w-100"
              placeholder="Ej: AX 7822 VT3P"
            />
          </Col>

          <Col xs={12} md={6}>
            <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>
              Días de madurez
            </Form.Label>
            <Form.Control
              name="diasMadurez"
              value={formData.diasMadurez}
              onChange={handleChange}
              required
              placeholder="Ej: 130-150"
              className="input-terrax w-100"
            />
          </Col>
        </>
      );
    }

    const labelTipo =
      categoriaSeleccionada === "FERTILIZANTES"
        ? "Nutriente principal"
        : categoriaSeleccionada === "AGROQUIMICOS"
        ? "Tipo de agroquímico"
        : "Tipo";

    return (
      <>
        <Col xs={12} md={6}>
          <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>
            Nombre
          </Form.Label>
          <Form.Control
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="input-terrax w-100"
            placeholder="Ej: Glifosato 48%"
          />
        </Col>

        <Col xs={12} md={6}>
          <Form.Label className="fw-semibold" style={{ color: verdeOscuro }}>
            {labelTipo}
          </Form.Label>
          <Form.Select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="input-terrax w-100"
          >
            <option value="">Seleccione una opción</option>
            {opciones[categoriaSeleccionada]?.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </Form.Select>

          {formData.tipo === "OTROS" && (
            <Form.Control
              type="text"
              placeholder="Especifique otro tipo"
              value={inputOtroTipo}
              onChange={(e) => setInputOtroTipo(e.target.value)}
              className="input-terrax mt-2 w-100"
            />
          )}
        </Col>
      </>
    );
  };

  return (
    <div
      className="terrax-card"
      style={{
        minHeight: "85vh", // cartulina blanca siempre del mismo tamaño
      }}
    >
      <Card.Body>
        <Card.Title className="fw-bold mb-4" style={{ color: verdeOscuro }}>
          Registrar Productos — {categoriaSeleccionada}
        </Card.Title>

        <Row className="g-4 align-items-stretch">
          {/* Sidebar categorías */}
          <Col md="auto" className="d-flex">
            <Card
              className="p-3 shadow-sm h-100 flex-fill"
              style={{
                width: 260,
                borderRadius: "1.2rem",
                border: `1px solid ${verde}20`,
                background: "#f9faf9",
              }}
            >
              <h6
                className="text-center fw-bold mb-3"
                style={{ color: verdeOscuro }}
              >
                Categorías
              </h6>

              {categorias.map((cat) => {
                const active = categoriaSeleccionada === cat.nombre;
                return (
                  <Button
                    key={cat.nombre}
                    className="btn-terrax mb-3 w-100"
                    style={{
                      backgroundColor: active ? verde : blanco,
                      color: active ? blanco : verdeOscuro,
                      border: active
                        ? `1px solid ${verde}`
                        : "1px solid #d9e4dd",
                    }}
                    onClick={() => setCategoriaSeleccionada(cat.nombre)}
                  >
                    {cat.nombre}
                  </Button>
                );
              })}
            </Card>
          </Col>

          {/* Panel derecho */}
          <Col className="d-flex flex-column">
            <div className="flex-fill d-flex flex-column">
              <Row className="align-items-center mb-3">
                <Col>
                  <h5
                    className="m-0 pb-2"
                    style={{
                      color: verdeOscuro,
                      borderBottom: `2px solid ${verde}22`,
                    }}
                  >
                    Agregar {categoriaSeleccionada}
                  </h5>
                </Col>
                <Col className="text-end">
                  <Button
                    className="btn-terrax-outline"
                    onClick={() => navigate("/productos")}
                  >
                    <FaArrowLeft className="me-2" /> Volver
                  </Button>
                </Col>
              </Row>

              <Card
                className="p-4 mb-3 rounded-4 shadow-sm"
                style={{ background: grisClaro, border: "none" }}
              >
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">{renderInputs()}</Row>
                  <Row className="mt-3">
                    <Col className="text-end">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="btn-terrax"
                      >
                        {submitting ? "Guardando..." : "Agregar"}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card>

              <Card
                className="p-3 rounded-4 shadow-sm"
                style={{ background: blanco, border: `1px solid ${verde}20` }}
              >
                <Row
                  className="fw-bold pb-2"
                  style={{
                    borderBottom: `2px solid ${verde}33`,
                    color: verdeOscuro,
                  }}
                >
                  {categoriaSeleccionada === "SEMILLAS" ? (
                    <>
                      <Col>Cultivo</Col>
                      <Col>Variedad</Col>
                      <Col>Días de madurez</Col>
                    </>
                  ) : (
                    <>
                      <Col>Nombre</Col>
                      <Col>Tipo</Col>
                    </>
                  )}
                </Row>
                <Row className="pt-2" style={{ color: grisOscuro }}>
                  {categoriaSeleccionada === "SEMILLAS" ? (
                    <>
                      <Col>{formData.cultivo || "—"}</Col>
                      <Col>{formData.variedad || "—"}</Col>
                      <Col>{formData.diasMadurez || "—"}</Col>
                    </>
                  ) : (
                    <>
                      <Col>{formData.nombre || "—"}</Col>
                      <Col>
                        {formData.tipo === "OTROS"
                          ? inputOtroTipo || "—"
                          : formData.tipo || "—"}
                      </Col>
                    </>
                  )}
                </Row>
              </Card>
            </div>

            <Row className="mt-4">
              <Col className="d-flex justify-content-end gap-3">
                <Button
                  className="btn-terrax-outline"
                  onClick={() => navigate("/productos")}
                >
                  <i className="bi bi-house-door me-2"></i> Volver al Inicio
                </Button>
                <Button
                  className="btn-terrax"
                  onClick={() => navigate("/productos/ver")}
                >
                  <i className="bi bi-card-list me-2"></i> Ver Mis Productos
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </div>
  );
};

export default ProductosForm;
