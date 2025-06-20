import React, { useState } from "react";
import axios from "axios";
import { Container, Button, Form, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const categorias = [
  { nombre: "COADYUVANTES", color: "#e9f7ef" },
  { nombre: "FERTILIZANTES", color: "#e9f7ef" },
  { nombre: "AGROQUIMICOS", color: "#e9f7ef" },
  { nombre: "SEMILLAS", color: "#e9f7ef" },
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
  ],
  FERTILIZANTES: [
    "NITRGENO",
    "FOSFORO",
    "POTASIO",
    "AZUFREW",
    "CALCIO",
    "MAGNESIO",
    "COMPLEJO (NPK)",
    "MATERIA ORGANICA",
    "OTROS",
  ],
  AGROQUIMICOS: [
    "HERBICIDA",
    "INSECTICIDA",
    "FUNGUICIDA",
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

const inputStyle = {
  backgroundColor: "#fff",
  borderRadius: "10px",
  padding: "10px 12px",
  fontSize: "16px",
  height: "44px",
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");

      let payload = { categoria: categoriaSeleccionada };

      if (categoriaSeleccionada === "SEMILLAS") {
        payload = {
          ...payload,
          cultivo: formData.cultivo,
          variedad: formData.variedad,
          dias_madurez: formData.diasMadurez,
        };
      } else {
        payload = {
          ...payload,
          nombre: formData.nombre,
          tipo: formData.tipo,
        };
      }
      console.log("Payload a enviar:", payload);
      await axios.post("http://localhost:8000/api/productos/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Producto agregado con éxito");
      setFormData({
        nombre: "",
        tipo: "",
        cultivo: "",
        variedad: "",
        diasMadurez: "",
      });
    } catch (error) {
      console.error("Error al guardar producto", error);
    }
  };

  const renderInputs = () => {
    if (categoriaSeleccionada === "SEMILLAS") {
      return (
        <>
          <Col md={4}>
            <Form.Label className="fw-semibold">Cultivo</Form.Label>
            <Form.Select
              name="cultivo"
              value={formData.cultivo}
              onChange={handleChange}
              required
              className="form-control"
              style={inputStyle}
            >
              <option value="">Seleccione un cultivo</option>
              {opciones.SEMILLAS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold">Variedad</Form.Label>
            <Form.Control
              name="variedad"
              value={formData.variedad}
              onChange={handleChange}
              required
              className="form-control"
              style={inputStyle}
            />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold">Días de madurez</Form.Label>
            <Form.Control
              name="diasMadurez"
              value={formData.diasMadurez}
              onChange={handleChange}
              required
              placeholder="Ej: 130-150"
              className="form-control"
              style={inputStyle}
            />
          </Col>
        </>
      );
    }

    const labelTipo =
      categoriaSeleccionada === "FERTILIZANTES"
        ? "Nutriente Principal"
        : categoriaSeleccionada === "AGROQUIMICOS"
        ? "Tipo de Agroquímico"
        : "Tipo";

    return (
      <>
        <Col md={5}>
          <Form.Label className="fw-semibold">Nombre</Form.Label>
          <Form.Control
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="form-control"
            style={inputStyle}
          />
        </Col>
        <Col md={5}>
          <Form.Label className="fw-semibold">{labelTipo}</Form.Label>
          <Form.Select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="form-control"
            style={inputStyle}
          >
            <option value="">Seleccione una opción</option>
            {opciones[categoriaSeleccionada]?.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </Form.Select>
        </Col>
      </>
    );
  };

  return (
    <Container fluid className="d-flex mt-4" style={{ minHeight: "80vh" }}>
      <Card
        className="p-3 me-4 shadow-sm"
        style={{ width: "250px", borderRadius: "20px" }}
      >
        <h5 className="text-center fw-bold">Categorías</h5>
        {categorias.map((cat) => (
          <Button
            key={cat.nombre}
            variant="light"
            className="mb-3 w-100"
            onClick={() => setCategoriaSeleccionada(cat.nombre)}
            style={{
              backgroundColor: cat.color,
              border: "none",
              borderRadius: "12px",
              color: "#000",
              height: "60px",
              fontSize: "18px",
              fontWeight: "400",
              boxShadow:
                categoriaSeleccionada === cat.nombre
                  ? "0 0 0 2px #198754"
                  : "none",
              transform:
                categoriaSeleccionada === cat.nombre
                  ? "scale(1.03)"
                  : "scale(1)",
            }}
          >
            {cat.nombre}
          </Button>
        ))}
      </Card>

      <div
        className="flex-grow-1 p-4 rounded-4 shadow-sm"
        style={{ backgroundColor: "#e0ece5" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Agregar {categoriaSeleccionada}</h5>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/productos")}
            style={{
              borderRadius: "10px",
              padding: "6px 14px",
              fontWeight: "500",
            }}
          >
            Volver
          </Button>
        </div>

        <Card
          className="p-4 my-3 rounded-4"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-center mb-3">
              {renderInputs()}
              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="submit"
                  className="w-100 fw-bold"
                  style={{
                    backgroundColor: "#198754",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                  }}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card className="p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
          <Row className="fw-bold border-bottom pb-2">
            {categoriaSeleccionada === "SEMILLAS" ? (
              <>
                <Col>Cultivo</Col>
                <Col>Variedad</Col>
                <Col>Días de Madurez</Col>
              </>
            ) : (
              <>
                <Col>Nombre</Col>
                <Col>Tipo</Col>
              </>
            )}
          </Row>
          <Row className="pt-2">
            {categoriaSeleccionada === "SEMILLAS" ? (
              <>
                <Col>{formData.cultivo}</Col>
                <Col>{formData.variedad}</Col>
                <Col>{formData.diasMadurez}</Col>
              </>
            ) : (
              <>
                <Col>{formData.nombre}</Col>
                <Col>{formData.tipo}</Col>
              </>
            )}
          </Row>
        </Card>
      </div>
    </Container>
  );
};

export default ProductosForm;
