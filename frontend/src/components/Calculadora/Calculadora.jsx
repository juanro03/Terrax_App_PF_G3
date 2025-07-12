import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Table, Form, Row, Col, Alert } from "react-bootstrap";
import { Trash2 } from "lucide-react";
import { Plus } from "lucide-react";
import axios from "axios";

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
    range: "0.1 – 0.2 L/ha",
    category: "herbicida",
  },
  {
    id: "acido-24d",
    name: "Ácido 2,4‑D",
    unit: "L",
    range: "30 L",
    category: "herbicida",
  },
  {
    id: "atrazina",
    name: "Atrazina",
    unit: "L",
    range: "3 L",
    category: "herbicida",
  },
  {
    id: "diclosulam",
    name: "Diclosulam",
    unit: "L",
    range: "30 L",
    category: "herbicida",
  },
  {
    id: "cletodim",
    name: "Cletodim",
    unit: "L",
    range: "0.5 – 1 L/ha",
    category: "herbicida",
  },
  {
    id: "haloxifop",
    name: "Haloxifop",
    unit: "L",
    range: "0.5 – 1.5 L/ha",
    category: "herbicida",
  },
  {
    id: "paraquat",
    name: "Paraquat",
    unit: "L",
    range: "2.5 L/ha",
    category: "herbicida",
  },
  {
    id: "cipermetrina",
    name: "Cipermetrina",
    unit: "mL",
    range: "20 – 75 mL",
    category: "insecticida",
  },
  {
    id: "imidacloprid",
    name: "Imidacloprid",
    unit: "mL",
    range: "100 – 300 mL/ha",
    category: "insecticida",
  },
  {
    id: "rynaxypyr",
    name: "Rynaxypyr",
    unit: "L",
    range: "0.1 – 0.2 L/ha",
    category: "insecticida",
  },
  {
    id: "flubendiamida",
    name: "Flubendiamida",
    unit: "L",
    range: "0.2 – 0.3 L/ha",
    category: "insecticida",
  },
  {
    id: "azoxistrobina",
    name: "Azoxistrobina‑Ciproconazol",
    unit: "L",
    range: "0.2 – 0.3 L/ha",
    category: "fungicida",
  },
  {
    id: "benomil",
    name: "Benomil",
    unit: "kg",
    range: "0.5 – 1 kg/ha",
    category: "fungicida",
  },
  {
    id: "carbendazim",
    name: "Carbendazim",
    unit: "L",
    range: "1 – 2 L/ha",
    category: "fungicida",
  },
];

const DEFAULT_ROWS = [
  { id: 1, productId: "", area: 0, dose: 0 },
  { id: 2, productId: "", area: 0, dose: 0 },
  { id: 3, productId: "", area: 0, dose: 0 },
];

function Calculadora() {
  const [lotes, setLotes] = useState([]);
  const [selectedLoteId, setSelectedLoteId] = useState("");
  const [cantHa, setCantHa] = useState(0);
  const [tankVolume, setTankVolume] = useState(1000);
  const [rows, setRows] = useState(DEFAULT_ROWS);

  useEffect(() => {
    async function fetchLotes() {
      try {
        const res = await axios.get("http://localhost:8000/api/lotes/");
        setLotes(res.data);
      } catch (err) {
        console.error("Error al obtener lotes:", err);
      }
    }

    fetchLotes();
  }, []);

  useEffect(() => {
    async function fetchLoteDetails() {
      try {
        if (selectedLoteId) {
          const res = await axios.get(
            `http://localhost:8000/api/lotes/${selectedLoteId}/`
          );
          setCantHa(res.data.area);
        }
      } catch (err) {
        console.error("Error al obtener hectáreas:", err);
      }
    }

    fetchLoteDetails();
  }, [selectedLoteId]);

  const updateRow = (id, field, value) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: Date.now(), productId: "", area: 0, dose: 0 },
    ]);

  const removeRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const resetCalculator = () => {
    setSelectedLoteId("");
    setCantHa(0);
    setTankVolume(1000);
    setRows(DEFAULT_ROWS);
  };

  const totals = useMemo(() => {
    const totalProduct = rows.reduce((sum, r) => {
      const selectedProduct = PRODUCTS.find((p) => p.id === r.productId);
      if (!selectedProduct) return sum;

      const dose = parseFloat(
        selectedProduct.range
          ?.match(/[\d.,]+(?=\s*(L|ml|kg)?\/?ha?$)?/g)
          ?.at(-1)
          ?.replace(",", ".") || "0"
      );

      let doseMl = 0;
      switch (selectedProduct.unit.toLowerCase()) {
        case "l":
          doseMl = dose * 1000;
          break;
        case "ml":
          doseMl = dose;
          break;
        case "kg":
          doseMl = dose * 1000; // solo si estás cómodo con esta conversión
          break;
        default:
          doseMl = 0;
      }

      return sum + cantHa * doseMl;
    }, 0);

    const water = tankVolume - totalProduct / 1000; // pasás el total de producto de mL a L para comparar con el tanque
    return { totalProduct, water, overflow: water < 0 };
  }, [rows, tankVolume, cantHa]);

  return (
    <Card className="shadow m-4 mx-auto" style={{ maxWidth: "960px" }}>
      <Card.Body>
        <Card.Title className="h4 mb-3">Calculadora de Caldo</Card.Title>

        <Row className="gy-2 align-items-end mb-1">
          <Col md={4}>
            <Form.Group controlId="selectLote" className="mb-0">
              <Form.Label className="text-dark">Seleccionar lote</Form.Label>
              <Form.Control
                as="select"
                value={selectedLoteId}
                onChange={(e) => setSelectedLoteId(e.target.value)}
                className="bg-light"
              >
                <option value="">Seleccione un lote</option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {lotes.length === 0 && (
              <Form.Text muted className="mt-1 d-block">
                No hay lotes disponibles.
              </Form.Text>
            )}
          </Col>

          <Col md={4}>
            <Form.Group controlId="cantHa" className="mb-0">
              <Form.Label className="text-dark">
                Cantidad de Hectáreas
              </Form.Label>
              <Form.Control
                type="number"
                value={cantHa}
                readOnly
                className="bg-light"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="tankVol" className="mb-0">
              <Form.Label className="text-dark">
                Volumen del Tanque (L)
              </Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={tankVolume}
                onChange={(e) => setTankVolume(Number(e.target.value))}
                className="bg-light"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="table-responsive mt-4">
          <Table bordered hover>
            <thead className="table-light">
              <tr className="text-center">
                <th>Productos a aplicar</th>
                <th className="text-end text-center">Ficha Técnica</th>
                <th className="text-end text-center">Dosis Máxima</th>
                <th className="text-end text-center">Producto Máximo</th>
                <th className="text-center">Eliminar</th>
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
                                  ?.match(/[\d.,]+(?=\s*(L|ml|kg)?\/?ha?$)?/g)
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
                            ?.match(/[\d.,]+(?=\s*(L|ml|kg)?\/?ha?$)?/g)
                            ?.at(-1)
                            ?.replace(",", ".") || "0"
                        );

                        let doseMl = 0;
                        switch (selectedProduct?.unit.toLowerCase()) {
                          case "l":
                            doseMl = dose * 1000;
                            break;
                          case "ml":
                            doseMl = dose;
                            break;
                          case "kg":
                            doseMl = dose * 1000; // aproximado
                            break;
                          default:
                            doseMl = 0;
                        }

                        return (cantHa * doseMl).toFixed(2) + " mL";
                      })()}
                    </td>

                    <td className="text-center">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div className="d-flex gap-2 mt-3">
          <Button variant="secondary" onClick={addRow}>
            <Plus size={18} /> Agregar
          </Button>

          <Button variant="outline-danger" onClick={resetCalculator}>
            Limpiar calculadora
          </Button>
        </div>

        <Row className="mt-4 gy-3">
          <Col md={4}>
            <Card bg="success" text="white">
              <Card.Body className="text-center">
                <small>Total producto (mL)</small>
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
