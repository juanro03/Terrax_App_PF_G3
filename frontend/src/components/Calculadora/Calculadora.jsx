import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Card,
  Row,
  Col,
  Form,
  Table,
  Tabs,
  Tab,
  Button,
  Modal,
} from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

// PALETA Y CONSTANTES
const verde = "#198754";
const verdeClaro = "#e9fbe5";
const verdeOscuro = "#155a36";
const grisClaro = "#f3f6f5";
const blanco = "#fff";
const grisOscuro = "#424242";

const UNIDADES = ["L", "ml", "cc"];

const suggestedLabels = [
  "Velocidad viento (km/h)",
  "Dirección viento",
  "Humedad (%)",
  "Temperatura (°C)",
  "Fecha",
  "Hora recomendada",
];
const realLabels = [
  "Velocidad viento (km/h)",
  "Dirección viento",
  "Humedad (%)",
  "Temperatura (°C)",
  "Fecha",
  "Hora real",
];

const Calculadora = () => {
  const [hectareas, setHectareas] = useState(0);
  const [ltsPorHa, setLtsPorHa] = useState(0);
  const [tamanoTanque, setTamanoTanque] = useState(0);
  const [litrosTotales, setLitrosTotales] = useState(0);
  const [showResumen, setShowResumen] = useState(false);
  const resumenRef = useRef();

  const [productos, setProductos] = useState([
    { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "L" },
  ]);

  const [productosSolidos, setProductosSolidos] = useState([
    {
      id: Date.now() + 1,
      envase: "",
      producto: "",
      dosis: "",
      unidad: "Kg/ha",
    },
  ]);

  const [observacionesTexto, setObservacionesTexto] = useState("");
  const [suggestedValues, setSuggestedValues] = useState(
    suggestedLabels.map(() => "")
  );
  const [realValues, setRealValues] = useState(realLabels.map(() => ""));

  // --- Prevent negativo ---
  const noNeg = (v) => {
    // Permitir borrar el input
    if (v === "") return "";

    // Si no es numero, mantener el texto para que el usuario pueda seguir escribiendo
    if (isNaN(Number(v))) return v;

    // Convertir a número y evitar negativos
    const n = Number(v);
    return n < 0 ? 0 : n;
  };
  // PDF
  const handleDescargarPDF = () => {
    const opt = {
      margin: 0.5,
      filename: "receta-terrax.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(resumenRef.current).set(opt).save();
  };

  const calcularTotalCampo = (dosis) => {
    const total = parseFloat(dosis) * parseFloat(hectareas);
    return isNaN(total) ? 0 : total;
  };

  const calcularBidones = (totalCampo, envase) => {
    if (!envase || parseFloat(envase) === 0) return "—";
    const bidones = parseFloat(totalCampo) / parseFloat(envase);
    return isNaN(bidones) ? "—" : bidones.toFixed(1);
  };

  // Recalcular litros totales
  useEffect(() => {
    const total = parseFloat(hectareas) * parseFloat(ltsPorHa);
    setLitrosTotales(isNaN(total) ? 0 : total);
  }, [hectareas, ltsPorHa]);

  const limpiarRegistros = () => {
    setHectareas(0);
    setLtsPorHa(0);
    setTamanoTanque(0);
    setProductos([
      { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "L" },
    ]);
    setProductosSolidos([
      {
        id: Date.now() + 1,
        envase: "",
        producto: "",
        dosis: "",
        unidad: "Kg/ha",
      },
    ]);
  };

  const limpiarObservaciones = () => {
    setObservacionesTexto("");
    setSuggestedValues(suggestedLabels.map(() => ""));
    setRealValues(realLabels.map(() => ""));
  };

  // --- CÁLCULOS ---
  const fracVol = litrosTotales % tamanoTanque;

  const sumaProdCompleto = productos.reduce((s, p) => {
    const v = (parseFloat(p.dosis) * tamanoTanque) / (ltsPorHa || 1);
    return s + (isNaN(v) ? 0 : v);
  }, 0);

  const sumaProdFraccionado = productos.reduce((s, p) => {
    const v = (parseFloat(p.dosis) * fracVol) / (ltsPorHa || 1);
    return s + (isNaN(v) ? 0 : v);
  }, 0);

  // UI
  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{
        maxWidth: "1160px",
        background: "#fff",
        borderRadius: "1.4rem",
        border: "none",
        transform: "none",
        transition: "none",
      }}
    >
      <Card.Body>
        <Card.Title
          className="fw-bold mb-4"
          style={{ color: verdeOscuro }}
        >
          Calculadora de Caldos
        </Card.Title>

        {/* FORM PRINCIPAL */}
        <Form>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label style={{ color: verdeOscuro }}>
                Total de hectáreas
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={hectareas}
                onChange={(e) => setHectareas(noNeg(e.target.value))}
              />
            </Col>

            <Col md={4}>
              <Form.Label style={{ color: verdeOscuro }}>
                Lts/Ha de caldo
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={ltsPorHa}
                onChange={(e) => setLtsPorHa(noNeg(e.target.value))}
              />
            </Col>

            <Col md={4}>
              <Form.Label style={{ color: verdeOscuro }}>
                Tamaño del tanque (L)
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={tamanoTanque}
                onChange={(e) => setTamanoTanque(noNeg(e.target.value))}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label style={{ color: verdeOscuro }}>
                Litros totales de caldo
              </Form.Label>
              <Form.Control
                readOnly
                value={litrosTotales.toFixed(0)}
                style={{ background: grisClaro, color: grisOscuro }}
              />
            </Col>
          </Row>
        </Form>

        {/* TABS */}
        <Tabs defaultActiveKey="liquidos" className="mb-3 calculadora-tabs">
          {/* TAB LÍQUIDOS */}
          <Tab
            eventKey="liquidos"
            title={<span style={{ color: "#000000" }}>Líquidos</span>}
          >
            <Row className="mb-4">
              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Productos utilizados</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Envase (L)</th>
                      <th>Producto</th>
                      <th>Dosis</th>
                      <th>Unidad</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Form.Control
                            type="number"
                            min={0}
                            value={p.envase}
                            onChange={(e) =>
                              setProductos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, envase: noNeg(e.target.value) }
                                    : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            value={p.producto}
                            onChange={(e) =>
                              setProductos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, producto: e.target.value }
                                    : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min={0}
                            value={p.dosis}
                            onChange={(e) =>
                              setProductos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, dosis: noNeg(e.target.value) }
                                    : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Select
                            value={p.unidad}
                            onChange={(e) =>
                              setProductos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, unidad: e.target.value }
                                    : x
                                )
                              )
                            }
                          >
                            {UNIDADES.map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              setProductos((prev) =>
                                prev.filter((x) => x.id !== p.id)
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <Button
                  size="sm"
                  onClick={() =>
                    setProductos((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        envase: "",
                        producto: "",
                        dosis: "",
                        unidad: "L",
                      },
                    ])
                  }
                  className="btn btn-success mt-2"
                >
                  <Plus size={14} /> Agregar producto
                </Button>
              </Col>

              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Resúmen automático</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Producto</th>
                      <th>Total campo</th>
                      <th>Bidones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => {
                      const total = calcularTotalCampo(p.dosis);
                      return (
                        <tr key={p.id}>
                          <td>{p.producto || "—"}</td>
                          <td>{total.toFixed(1)} L</td>
                          <td>{calcularBidones(total, p.envase)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>
            {/* TANQUES REQUERIDOS */}
            <Row className="mb-4">
              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Tanques requeridos</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Completos</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {tamanoTanque > 0
                          ? Math.floor(litrosTotales / tamanoTanque)
                          : "—"}
                      </td>
                      <td>
                        {tamanoTanque > 0
                          ? ((litrosTotales / tamanoTanque) % 1).toFixed(2)
                          : "—"}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Litros por tanque</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Por tanque</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{tamanoTanque} L</td>
                      <td>
                        {tamanoTanque > 0
                          ? (litrosTotales % tamanoTanque).toFixed(0)
                          : "—"}{" "}
                        L
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* POR TANQUE */}
            <Row className="mb-4">
              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Por tanque completo</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Producto</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => {
                      const val =
                        (parseFloat(p.dosis) * tamanoTanque) / (ltsPorHa || 1);
                      return (
                        <tr key={p.id}>
                          <td>{p.producto || "—"}</td>
                          <td>
                            {isNaN(val) ? "—" : `${val.toFixed(2)} ${p.unidad}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Col>

              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Por tanque fraccionado</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Producto</th>
                      <th>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => {
                      const frac = litrosTotales % tamanoTanque;
                      const val =
                        (parseFloat(p.dosis) * frac) / (ltsPorHa || 1);
                      return (
                        <tr key={p.id}>
                          <td>{p.producto || "—"}</td>
                          <td>
                            {isNaN(val) ? "—" : `${val.toFixed(2)} ${p.unidad}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* TOTAL PRODUCTO PURO */}
            <Row className="mb-4">
              <Col>
                <h5 style={{ color: verdeOscuro }}>
                  Total de producto puro por tanque
                </h5>

                <Table size="sm" bordered className="text-center">
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Completo</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {sumaProdCompleto.toFixed(2)} L
                      </td>
                      <td>
                        {sumaProdFraccionado.toFixed(2)} L
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* AGUA */}
            <Row className="mb-4">
              <Col>
                <h5 style={{ color: verdeOscuro }}>
                  Total de agua en el tanque
                </h5>

                <Table size="sm" bordered className="text-center">
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Completo</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: "bold" }}>
                        {(tamanoTanque - sumaProdCompleto).toFixed(2)} L
                      </td>
                      <td style={{ fontWeight: "bold" }}>
                        {(fracVol - sumaProdFraccionado).toFixed(2)} L
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row>
              <Col className="text-end">
                <Button
                  className="btn btn-success"
                  onClick={limpiarRegistros}
                >
                  Limpiar registros
                </Button>
              </Col>
            </Row>
          </Tab>

          {/* TAB SÓLIDOS */}
          <Tab
            eventKey="solidos"
            title={<span style={{ color: "#000000" }}>Sólidos</span>}
          >
            <Row className="mb-4">
              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Insumos sólidos</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Bolsa (Kg)</th>
                      <th>Producto</th>
                      <th>Dosis</th>
                      <th>Unidad</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {productosSolidos.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Form.Control
                            type="number"
                            min={0}
                            value={p.envase}
                            onChange={(e) =>
                              setProductosSolidos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, envase: noNeg(e.target.value) }
                                    : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            value={p.producto}
                            onChange={(e) =>
                              setProductosSolidos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, producto: e.target.value }
                                    : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min={0}
                            value={p.dosis}
                            onChange={(e) =>
                              setProductosSolidos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, dosis: noNeg(e.target.value) }
                                    : x
                                )
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Select
                            value={p.unidad}
                            onChange={(e) =>
                              setProductosSolidos((prev) =>
                                prev.map((x) =>
                                  x.id === p.id
                                    ? { ...x, unidad: e.target.value }
                                    : x
                                )
                              )
                            }
                          >
                            <option>Kg/ha</option>
                            <option>g/ha</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              setProductosSolidos((prev) =>
                                prev.filter((x) => x.id !== p.id)
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <Button
                  size="sm"
                  onClick={() =>
                    setProductosSolidos((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        envase: "",
                        producto: "",
                        dosis: "",
                        unidad: "Kg/ha",
                      },
                    ])
                  }
                  className="btn btn-success mt-2"
                >
                  <Plus size={14} /> Agregar línea
                </Button>
              </Col>

              <Col md={6}>
                <h5 style={{ color: verdeOscuro }}>Resumen sólidos</h5>

                <Table size="sm" bordered>
                  <thead>
                    <tr style={{ background: verde, color: "#fff" }}>
                      <th>Producto</th>
                      <th>Total (Kg)</th>
                      <th>Bolsas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosSolidos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.producto || "—"}</td>
                        <td>
                          {(
                            parseFloat(p.dosis) * parseFloat(hectareas) || 0
                          ).toFixed(1)}
                        </td>
                        <td>
                          {p.envase
                            ? (
                              (parseFloat(p.dosis) * parseFloat(hectareas)) /
                              parseFloat(p.envase)
                            ).toFixed(1)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row>
              <Col className="text-end">
                <Button
                  className="btn btn-success"
                  onClick={limpiarRegistros}
                >
                  Limpiar registros
                </Button>
              </Col>
            </Row>
          </Tab>

          {/* TAB OBSERVACIONES */}
          <Tab
            eventKey="observaciones"
            title={<span style={{ color: "#000000" }}>Observaciones</span>}
          >            <Card className="mb-4">
              <Card.Body>
                <h5 style={{ color: verdeOscuro }}>Observaciones</h5>

                <Form.Control
                  as="textarea"
                  rows={4}
                  value={observacionesTexto}
                  onChange={(e) => setObservacionesTexto(e.target.value)}
                />
              </Card.Body>
            </Card>

            {/* Condiciones */}
            <Row className="gx-4 gy-4 mb-4">
              {[{
                title: "Condiciones sugeridas",
                labels: suggestedLabels,
                values: suggestedValues,
                setValues: setSuggestedValues
              }, {
                title: "Condiciones reales",
                labels: realLabels,
                values: realValues,
                setValues: setRealValues
              }].map(({ title, labels, values, setValues }) => (
                <Col md={6} key={title}>
                  <Card>
                    <Card.Header style={{ background: verdeClaro }}>
                      <h6 style={{ color: verdeOscuro }}>{title}</h6>
                    </Card.Header>

                    <Card.Body className="p-2">
                      <Table size="sm" borderless>
                        <tbody>
                          {labels.map((label, idx) => {
                            let type = "number";
                            let min = 0;

                            if (label.toLowerCase().includes("dirección"))
                              type = "text";
                            if (label.toLowerCase().includes("fecha"))
                              type = "date";
                            if (label.toLowerCase().includes("hora"))
                              type = "time";

                            return (
                              <tr key={label}>
                                <td style={{ width: "55%" }}>
                                  <strong>{label}</strong>
                                </td>
                                <td>
                                  <Form.Control
                                    type={type}
                                    min={min}
                                    value={values[idx]}
                                    onChange={(e) => {
                                      const val = type === "number"
                                        ? noNeg(e.target.value)
                                        : e.target.value;

                                      const arr = [...values];
                                      arr[idx] = val;
                                      setValues(arr);
                                    }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Buttons */}
            <Row className="gx-3">
              <Col md={6}>
                <Button
                  className="btn btn-success w-100"
                  onClick={() => setShowResumen(true)}
                >
                  Generar Receta
                </Button>
              </Col>

              <Col md={6}>
                <Button
                  className="btn btn-outline-success w-100"
                  onClick={limpiarObservaciones}
                >
                  Limpiar
                </Button>
              </Col>
            </Row>

            {/* Modal resumen */}
            <Modal
              show={showResumen}
              onHide={() => setShowResumen(false)}
              size="lg"
              centered
            >
              <Modal.Header closeButton style={{ background: verdeClaro }}>
                <Modal.Title style={{ color: verdeOscuro }}>
                  Resumen de Receta Generada
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <div ref={resumenRef}>
                  {/* ACA VA EL PDF */}
                  <h3 style={{ color: verdeOscuro }}>Resumen de Receta</h3>
                  <p>Total hectáreas: {hectareas}</p>
                  <p>Total litros: {litrosTotales.toFixed(0)}</p>
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button className="btn btn-success" onClick={handleDescargarPDF}>
                  Descargar PDF
                </Button>

                <Button
                  className="btn btn-outline-success"
                  onClick={() => setShowResumen(false)}
                >
                  Cerrar
                </Button>
              </Modal.Footer>
            </Modal>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default Calculadora;
