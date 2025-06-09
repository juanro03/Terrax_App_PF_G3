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
    range: "0.1–0.2 L/ha",
    category: "insecticida",
  },
  {
    id: "clorpirifos",
    name: "Clorpirifos",
    unit: "L",
    range: "0.3–0.6 L/ha",
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
  { id: 1, productId: "", area: 0, dose: 0 },
  { id: 2, productId: "", area: 0, dose: 0 },
  { id: 3, productId: "", area: 0, dose: 0 },
];

function Calculadora() {
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [tankVolume, setTankVolume] = useState(1000);
  const [cantHa, setCantHa] = useState(100);
  const [rows, setRows] = useState(DEFAULT_ROWS);

  // Producto seleccionado
  const product = useMemo(
    () => PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0],
    [productId]
  );

  const resetCalculator = () => {
    setCantHa(0);
    setTankVolume(0);
    setRows([]);
  };

  // Totales
  const totals = useMemo(() => {
    const totalProduct = rows.reduce((sum, r) => {
      const product = PRODUCTS.find((p) => p.id === r.productId);
      const dose = parseFloat(
        product?.range
          .match(/[\d.,]+(?=\s*(L|ml|kg)?\/?ha?$)?/g)
          ?.at(-1)
          ?.replace(",", ".") || "0"
      );
      return sum + cantHa * dose;
    }, 0);

    const water = tankVolume - totalProduct;
    return { totalProduct, water, overflow: water < 0 };
  }, [rows, tankVolume, cantHa]);

  // ----- helpers -----
  const updateRow = (id, field, value) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: Date.now(), name: `Producto ${prev.length + 1}`, area: 0, dose: 0 },
    ]);

  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  // ------------------- UI ---------------------------
  return (
    <Card className="shadow m-4 mx-auto" style={{ maxWidth: "960px" }}>
      <Card.Body>
        <Card.Title className="h4 mb-3">Calculadora de Caldo</Card.Title>

        {/* Selector cantidad de hectareas + volumen */}
        <Row className="gy-2 align-items-end mb-1">
          <Col md={6}>
            <Form.Group controlId="cantHa">
              <Form.Label className="text-dark">
                Cantidad de Hectáreas
              </Form.Label>
              <Form.Control
                className="bg-light"
                type="number"
                min={1}
                value={cantHa}
                onChange={(e) => setCantHa(Number(e.target.value))}
              />
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

        <Row className="mb-3">
          <Col md={6}>
            <div className="small text-muted">
              Siga el orden correspondiente a la hora de la aplicación de
              producto.
              <br />
            </div>
          </Col>
        </Row>

        {/* Tabla de productos */}
        <div className="table-responsive mt-4">
          <Table bordered hover>
            <thead className="table-light">
              <tr className="text-center">
                <th>Productos a aplicar</th>
                <th className="text-end text-center">Ficha Técnica</th>
                <th className="text-end text-center">Dosis Máxima</th>
                <th className="text-end text-center">Producto Máximo</th>
                <th style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const selectedProduct = PRODUCTS.find(
                  (p) => p.id === row.productId
                );

                return (
                  <tr key={row.id}>
                    <td>
                      <Form.Select
                        value={row.productId}
                        onChange={(e) =>
                          updateRow(row.id, "productId", e.target.value)
                        }
                      >
                        <option value="">Seleccionar producto</option>
                        {PRODUCTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>

                    <td className="text-end">
                      <Form.Control
                        type="text"
                        value={selectedProduct?.range || ""}
                        readOnly
                        className="bg-light text-end"
                      />
                    </td>

                    <td className="text-end">
                      <Form.Control
                        type="number"
                        readOnly
                        value={
                          selectedProduct
                            ? parseFloat(
                                selectedProduct.range
                                  .match(/[\d.,]+(?=\s*(L|ml|kg)?\/?ha?$)?/g)
                                  ?.at(-1)
                                  ?.replace(",", ".") || 0
                              ).toFixed(2)
                            : "0.00"
                        }
                        className="bg-light text-end"
                      />
                    </td>

                    <td className="text-end align-middle fw-medium">
                      {(() => {
                        const dose = parseFloat(
                          selectedProduct?.range
                            .match(/[\d.,]+(?=\s*(L|ml|kg)?\/?ha?$)?/g)
                            ?.at(-1)
                            ?.replace(",", ".") || "0"
                        );
                        const area = parseFloat(row.area || 0);
                        return (
                          (cantHa * dose).toFixed(2) +
                          " " +
                          (selectedProduct?.unit || "")
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div className="d-flex gap-2 mt-3">
          <Button
            variant="secondary"
            className="d-flex align-items-center gap-1"
            onClick={addRow}
          >
            <Plus size={18} /> Agregar
          </Button>

          <Button variant="outline-danger" onClick={resetCalculator}>
            Limpiar calculadora
          </Button>
        </div>

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
