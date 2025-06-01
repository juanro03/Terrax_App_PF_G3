// Calculadora.jsx
// Versión 100 % Bootstrap 5 utilizando react‑bootstrap (sin Tailwind).
// Copiá este archivo en src/components/Calculadora/Calculadora.jsx
// ---------------------------------------------------------------------------

import React, { useState, useMemo } from "react";
import { Card, Button, Table, Form, Row, Col, Alert } from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

// 1 ‑ Dependencias a instalar:
//    npm install bootstrap react-bootstrap lucide-react
// 2 ‑ CSS global (en index.js o App.js):
//    import "bootstrap/dist/css/bootstrap.min.css";

// -------------------- Datos mock -----------------------------
const PRODUCTS = [
  {
    id: "fipronil",
    name: "Fipronil",
    unit: "L",
    range: "0.1 – 0.2 L/ha",
    category: "insecticida",
  },
  {
    id: "clorpirifos",
    name: "Clorpirifos",
    unit: "L",
    range: "0.3 – 0.6 L/ha",
    category: "insecticida",
  },
  {
    id: "glifosato",
    name: "Glifosato",
    unit: "L",
    range: "0.1-0.2 L/ha",
    category: "herbicida",
  },
  {
    id: "acido 2.4-diclorofenox",
    name: "Ácido 2.4-Diclorofenox",
    unit: "L",
    range: "30 L",
    category: "herbicida",
  },
  {
    id: "atrazina",
    name: "Atrazina",
    unit: "L",
    range: "3 L",
    category: "herbicida",
  },
  {
    id: "diclosulam",
    name: "Diclosulam",
    unit: "L",
    range: "30 L",
    category: "herbicida",
  },
  {
    id: "cletodim",
    name: "Cletodim",
    unit: "L",
    range: "0.5-1 L/ha",
    category: "herbicida",
  },
  {
    id: "haloxifop",
    name: "Haloxifop",
    unit: "L",
    range: "0.5-1.5 L/ha",
    category: "herbicida",
  },
  {
    id: "paraquat",
    name: "Paraquat",
    unit: "L",
    range: "2.5 L/ha",
    category: "herbicida",
  },
  {
    id: "cipermetrina",
    name: "Cipermetrina",
    unit: "ml",
    range: "20-75 ml",
    category: "insecticida",
  },
  {
    id: "imidacloprid",
    name: "Imidacloprid",
    unit: "ml",
    range: "100-300 ml/ha",
    category: "insecticida",
  },
  {
    id: "rynaxypyr",
    name: "Rynaxypyr",
    unit: "L",
    range: "0.1-0.2 L/ha",
    category: "insecticida",
  },
  {
    id: "flubendiamida",
    name: "Flubendiamida",
    unit: "L",
    range: "0.2-0.3 L/ha",
    category: "insecticida",
  },
  {
    id: "azoxistrobina-ciproconazol",
    name: "Azoxistrobina-Ciproconazol",
    unit: "L",
    range: "0.2-0.3 L/ha",
    category: "fungicida",
  },
  {
    id: "benomil",
    name: "Benomil",
    unit: "kg",
    range: "0.5-1 kg/ha",
    category: "fungicida",
  },
  {
    id: "carbendazim",
    name: "Carbendazim",
    unit: "L",
    range: "1-2 L/ha",
    category: "fungicida",
  },
];

const DEFAULT_ROWS = [
  { id: 1, name: "Zona 1", area: 0, dose: 0 },
  { id: 2, name: "Zona 2", area: 0, dose: 0 },
  { id: 3, name: "Zona 3", area: 0, dose: 0 },
];

function Calculadora() {
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [tankVolume, setTankVolume] = useState(1000);
  const [rows, setRows] = useState(DEFAULT_ROWS);

  // Producto seleccionado
  const product = useMemo(
    () => PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0],
    [productId]
  );

  // Totales
  const totals = useMemo(() => {
    const totalProduct = rows.reduce(
      (sum, r) => sum + Number(r.area || 0) * Number(r.dose || 0),
      0
    );
    const water = tankVolume - totalProduct;
    return { totalProduct, water, overflow: water < 0 };
  }, [rows, tankVolume]);

  // ----- helpers -----
  const updateRow = (id, field, value) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: Date.now(), name: `Zona ${prev.length + 1}`, area: 0, dose: 0 },
    ]);

  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  // ------------------- UI ---------------------------
  return (
    <Card className="shadow m-4 mx-auto" style={{ maxWidth: "960px" }}>
      <Card.Body>
        <Card.Title className="h4 mb-3">Calculadora de Caldo</Card.Title>

        {/* Selector producto + volumen */}
        <Row className="gy-3 align-items-end">
          <Col md={6}>
            <Form.Group controlId="selectProduct">
              <Form.Label className="text-dark">Producto</Form.Label>
              <Form.Select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Dosis de etiqueta: {product.range}
              </Form.Text>
              <Form.Text className="text-muted">
                Categoría: {product.category}
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="tankVol">
              <Form.Label className="text-dark">
                Volumen del Tanque (L)
              </Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={tankVolume}
                onChange={(e) => setTankVolume(Number(e.target.value))}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Tabla de zonas */}
        <div className="table-responsive mt-4">
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>Zonas Afectadas</th>
                <th className="text-end">Área (ha)</th>
                <th className="text-end">Dosis ({product.unit}/ha)</th>
                <th className="text-end">Producto ({product.unit})</th>
                <th style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Form.Control
                      value={row.name}
                      onChange={(e) =>
                        updateRow(row.id, "name", e.target.value)
                      }
                    />
                  </td>
                  <td className="text-end">
                    <Form.Control
                      type="number"
                      min={0}
                      step={0.1}
                      value={row.area}
                      onChange={(e) =>
                        updateRow(row.id, "area", e.target.value)
                      }
                    />
                  </td>
                  <td className="text-end">
                    <Form.Control
                      type="number"
                      min={0}
                      step={0.1}
                      value={row.dose}
                      onChange={(e) =>
                        updateRow(row.id, "dose", e.target.value)
                      }
                    />
                  </td>
                  <td className="text-end align-middle fw-medium">
                    {(row.area * row.dose || 0).toFixed(2)}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Button
          variant="secondary"
          className="d-flex align-items-center gap-1"
          onClick={addRow}
        >
          <Plus size={18} /> Agregar zona
        </Button>

        {/* Resultados */}
        <Row className="mt-4 gy-3">
          <Col md={4}>
            <Card bg="success" text="white">
              <Card.Body className="text-center">
                <small>Total producto ({product.unit})</small>
                <h3 className="fw-bold mb-0 mt-1">
                  {totals.totalProduct.toFixed(2)}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg={totals.overflow ? "danger" : "primary"} text="white">
              <Card.Body className="text-center">
                <small>Agua necesaria (L)</small>
                <h3 className="fw-bold mb-0 mt-1">{totals.water.toFixed(0)}</h3>
              </Card.Body>
            </Card>
          </Col>
          {totals.overflow && (
            <Col md={4}>
              <Alert
                variant="danger"
                className="h-100 d-flex align-items-center justify-content-center"
              >
                ¡El tanque es demasiado pequeño!
              </Alert>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
}

export default Calculadora;
