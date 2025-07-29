import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { Plus, Trash2 } from "lucide-react";

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
  const [productos, setProductos] = useState([
    { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "L" },
  ]);
  const [observacionesTexto, setObservacionesTexto] = useState("");
  const [suggestedValues, setSuggestedValues] = useState(
    suggestedLabels.map(() => "")
  );
  const [realValues, setRealValues] = useState(realLabels.map(() => ""));

  useEffect(() => {
    const total = parseFloat(hectareas) * parseFloat(ltsPorHa);
    setLitrosTotales(isNaN(total) ? 0 : total);
  }, [hectareas, ltsPorHa]);

  const agregarProducto = () => {
    setProductos((prev) => [
      ...prev,
      { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "L" },
    ]);
  };

  const eliminarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  // Limpiar todos los registros
  const limpiarRegistros = () => {
    setHectareas(0);
    setLtsPorHa(0);
    setTamanoTanque(0);
    setProductos([
      { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "L" },
    ]);
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
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

  const limpiarObservaciones = () => {
    setObservacionesTexto("");
    setSuggestedValues(suggestedLabels.map(() => ""));
    setRealValues(realLabels.map(() => ""));
  };

  // ** NUEVOS CÁLCULOS PARA AGUA EN TANQUE **
  const fracVol = litrosTotales % tamanoTanque;
  const sumaProdCompleto = productos.reduce((sum, p) => {
    const v = (parseFloat(p.dosis) * tamanoTanque) / (ltsPorHa || 1);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const sumaProdFraccionado = productos.reduce((sum, p) => {
    const v = (parseFloat(p.dosis) * fracVol) / (ltsPorHa || 1);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  return (
    <Card
      className="mx-auto my-4 shadow-sm"
      style={{
        maxWidth: "1180px",
        width: "100%",
        backgroundColor: "#DFF5E1",
      }}
    >
      <Card.Body>
        <Card.Title>Calculadora de Caldos</Card.Title>

        {/* Campos principales */}
        <Form>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label>Total de hectáreas</Form.Label>
              <Form.Control
                type="number"
                placeholder="150"
                value={hectareas}
                onChange={(e) => setHectareas(+e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Lts/Ha de caldo</Form.Label>
              <Form.Control
                type="number"
                placeholder="10"
                value={ltsPorHa}
                onChange={(e) => setLtsPorHa(+e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Tamaño del tanque (L)</Form.Label>
              <Form.Control
                type="number"
                placeholder="400"
                value={tamanoTanque}
                onChange={(e) => setTamanoTanque(+e.target.value)}
              />
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={4}>
              <Form.Label>Litros totales de caldo</Form.Label>
              <Form.Control readOnly value={litrosTotales.toFixed(0)} />
            </Col>
          </Row>
        </Form>

        {/* Pestañas */}
        <Tabs defaultActiveKey="liquidos" className="mb-3">
          <Tab eventKey="liquidos" title="Líquidos">
            {/* Productos utilizados */}
            <Row className="mb-4">
              <Col md={6}>
                <h5>Productos utilizados</h5>
                <Table size="sm" bordered hover>
                  <thead className="thead-terrax">
                    <tr>
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
                            size="sm"
                            value={p.envase}
                            onChange={(e) =>
                              actualizarProducto(p.id, "envase", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={p.producto}
                            onChange={(e) =>
                              actualizarProducto(
                                p.id,
                                "producto",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={p.dosis}
                            onChange={(e) =>
                              actualizarProducto(p.id, "dosis", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={p.unidad}
                            onChange={(e) =>
                              actualizarProducto(p.id, "unidad", e.target.value)
                            }
                          >
                            {UNIDADES.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => eliminarProducto(p.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button variant="success" size="sm" onClick={agregarProducto}>
                  <Plus size={14} /> Agregar producto
                </Button>
              </Col>

              {/* Resumen automático */}
              <Col md={6}>
                <h5>Resumen automático</h5>
                <Table size="sm" bordered className="text-center">
                  <thead className="table-success">
                    <tr>
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

            {/* Tanques requeridos y litros */}
            <Row className="mb-4">
              <Col md={6}>
                <h5>Tanques requeridos</h5>
                <Table size="sm" bordered className="text-center">
                  <thead className="table-success">
                    <tr>
                      <th>Completos</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{Math.floor(litrosTotales / tamanoTanque)}</td>
                      <td>{((litrosTotales / tamanoTanque) % 1).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h5>Litros por tanque</h5>
                <Table size="sm" bordered className="text-center">
                  <thead className="table-success">
                    <tr>
                      <th>Por tanque</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{tamanoTanque} L</td>
                      <td>{(litrosTotales % tamanoTanque).toFixed(0)} L</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* Cantidades por tanque */}
            <Row className="mb-4">
              <Col md={6}>
                <h5>Por tanque completo</h5>
                <Table size="sm" bordered className="text-center">
                  <thead className="table-success">
                    <tr>
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
                <h5>Por tanque fraccionado</h5>
                <Table size="sm" bordered className="text-center">
                  <thead className="table-success">
                    <tr>
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

            {/* Totales finales */}
            <Row className="mb-4">
              <Col>
                <h5>Resultados</h5>
                <div
                  className="text-center text-black py-2"
                  style={{
                    backgroundColor: "#cfd0cfff",
                    borderRadius: "4px 4px 0 0",
                  }}
                >
                  Total de producto puro por tanque{" "}
                  <i className="bi bi-arrow-down-circle" />
                </div>
                <Table size="sm" bordered className="text-center">
                  <thead className="bg-danger text-white">
                    <tr>
                      <th>Completo</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {productos
                          .reduce((s, p) => {
                            const v =
                              (parseFloat(p.dosis) * tamanoTanque) /
                              (ltsPorHa || 1);
                            return s + (isNaN(v) ? 0 : v);
                          }, 0)
                          .toFixed(2)}{" "}
                        L
                      </td>
                      <td>
                        {productos
                          .reduce((s, p) => {
                            const frac = litrosTotales % tamanoTanque;
                            const v =
                              (parseFloat(p.dosis) * frac) / (ltsPorHa || 1);
                            return s + (isNaN(v) ? 0 : v);
                          }, 0)
                          .toFixed(2)}{" "}
                        L
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col>
                <div
                  className="text-center text-black py-2"
                  style={{
                    backgroundColor: "#7f9eb2ff",
                    borderRadius: "4px 4px 0 0",
                  }}
                >
                  Total de agua en el tanque{" "}
                  <i className="bi bi-arrow-down-circle" />
                </div>
                <Table
                  bordered
                  className="text-center"
                  style={{
                    backgroundColor: "#0066FF",
                    color: "white",
                    marginBottom: 0,
                  }}
                >
                  <tbody>
                    <tr>
                      {/* Agua necesaria para llenar un tanque completo */}
                      <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                        {(tamanoTanque - sumaProdCompleto).toFixed(2)} Lts
                      </td>
                      {/* Agua restante en el tanque fraccionado */}
                      <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                        {(fracVol - sumaProdFraccionado).toFixed(2)} Lts
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            {/* Botón Limpiar registros */}
            <Row className="mb-4">
              <Col className="text-end">
                <Button variant="success" onClick={limpiarRegistros}>
                  Limpiar registros
                </Button>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="solidos" title="Sólidos">
            {/* Sólidos */}
            <Row className="mb-4">
              <Col md={6}>
                <h5>Insumos sólidos</h5>
                <Table size="sm" bordered className="text-center">
                  <thead className="bg-light">
                    <tr>
                      <th>Bolsa (Kg)</th>
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
                            size="sm"
                            type="number"
                            value={p.envase}
                            onChange={(e) =>
                              actualizarProducto(p.id, "envase", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={p.producto}
                            onChange={(e) =>
                              actualizarProducto(
                                p.id,
                                "producto",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={p.dosis}
                            onChange={(e) =>
                              actualizarProducto(p.id, "dosis", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={p.unidad}
                            onChange={(e) =>
                              actualizarProducto(p.id, "unidad", e.target.value)
                            }
                          >
                            <option>Kg/ha</option>
                            <option>g/ha</option>
                          </Form.Select>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => eliminarProducto(p.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button variant="success" size="sm" onClick={agregarProducto}>
                  <Plus size={14} /> Agregar línea
                </Button>
              </Col>
              <Col md={6}>
                <h5>Resumen Sólidos</h5>
                <Table size="sm" bordered className="text-center">
                  <thead className="table-success">
                    <tr>
                      <th>Producto</th>
                      <th>Total (Kg)</th>
                      <th>Bolsas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
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
          </Tab>
          {/* Líquidos y otros tabs... */}
          <Tab eventKey="observaciones" title="Observaciones">
            <Card className="mb-4 rounded-xl shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Observaciones</h5>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Escriba observaciones..."
                  value={observacionesTexto}
                  onChange={(e) => setObservacionesTexto(e.target.value)}
                  className="shadow-sm rounded"
                />
              </Card.Body>
            </Card>

            <Row className="gx-4 gy-4 mb-4">
              {[
                { title: "Condiciones sugeridas", labels: suggestedLabels },
                { title: "Condiciones reales", labels: realLabels },
              ].map(({ title, labels }) => (
                <Col md={6} key={title}>
                  <Card className="condiciones-card rounded-xl shadow-sm h-100">
                    <Card.Header className="bg-verde-claro">
                      <h6 className="mb-0">{title}</h6>
                    </Card.Header>
                    <Card.Body className="p-2">
                      <Table
                        size="sm"
                        borderless
                        className="condiciones-table mb-0"
                      >
                        <tbody>
                          {labels.map((label, idx) => (
                            <tr key={label}>
                              <td
                                className="fw-semibold text-terrax-oscuro"
                                style={{ width: "60%" }}
                              >
                                {label}
                              </td>
                              <td>
                                <Form.Control
                                  size="sm"
                                  className="shadow-sm rounded"
                                  value={
                                    title === "Condiciones sugeridas"
                                      ? suggestedValues[idx]
                                      : realValues[idx]
                                  }
                                  onChange={(e) => {
                                    if (title === "Condiciones sugeridas") {
                                      const vals = [...suggestedValues];
                                      vals[idx] = e.target.value;
                                      setSuggestedValues(vals);
                                    } else {
                                      const vals = [...realValues];
                                      vals[idx] = e.target.value;
                                      setRealValues(vals);
                                    }
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="gx-3">
              <Col md={6}>
                <Button
                  className="btn-terrax-light w-100 d-flex align-items-center justify-content-center"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-filetype-pdf me-2" /> Generar Receta
                </Button>
              </Col>
              <Col md={6}>
                <Button
                  variant="success"
                  className="w-100 d-flex align-items-center justify-content-center"
                  onClick={limpiarObservaciones}
                >
                  <i className="bi bi-backspace me-2" /> Limpiar
                </Button>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default Calculadora;
