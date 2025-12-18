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

// Acción para exportar a PDF el contenido del modal

const Calculadora = () => {
  const [hectareas, setHectareas] = useState("");
  const [showResumen, setShowResumen] = useState(false);
  const resumenRef = useRef();
  const [ltsPorHa, setLtsPorHa] = useState("");
  const [tamanoTanque, setTamanoTanque] = useState("");
  const [litrosTotales, setLitrosTotales] = useState(0);
  const [productos, setProductos] = useState([
    { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "L" },
  ]);
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

  const getResumenText = () => {
    return (
      <div id="resumen-receta-pdf">
        <h3 style={{ color: verdeOscuro }}>
          Resumen de Receta para Aplicación en Campo
        </h3>
        <hr />
        <h5 style={{ color: verdeOscuro }}>Entradas de la Calculadora</h5>
        <ul>
          <li>
            <b>Total de hectáreas:</b> {hectareas} ha
          </li>
          <li>
            <b>Lts/ha de caldo:</b> {ltsPorHa} L
          </li>
          <li>
            <b>Tamaño del tanque:</b> {tamanoTanque} L
          </li>
          <li>
            <b>Litros totales de caldo:</b> {litrosTotales.toFixed(0)} L
          </li>
        </ul>
        {/* --- RESULTADOS DE LA CALCULADORA --- */}
        <h5 style={{ color: verdeOscuro, marginTop: 24 }}>
          Tanques requeridos
        </h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verdeClaro, color: verdeOscuro }}>
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

        <h5 style={{ color: verdeOscuro, marginTop: 24 }}>Litros por tanque</h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verdeClaro, color: verdeOscuro }}>
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

        <h5 style={{ color: verdeOscuro, marginTop: 24 }}>
          Por tanque completo
        </h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verdeClaro, color: verdeOscuro }}>
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
                  <td>{isNaN(val) ? "—" : `${val.toFixed(2)} ${p.unidad}`}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <h5 style={{ color: verdeOscuro, marginTop: 24 }}>
          Por tanque fraccionado
        </h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verdeClaro, color: verdeOscuro }}>
              <th>Producto</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const frac = litrosTotales % tamanoTanque;
              const val = (parseFloat(p.dosis) * frac) / (ltsPorHa || 1);
              return (
                <tr key={p.id}>
                  <td>{p.producto || "—"}</td>
                  <td>{isNaN(val) ? "—" : `${val.toFixed(2)} ${p.unidad}`}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <h5 style={{ color: verdeOscuro, marginTop: 24 }}>
          Total de producto puro por tanque
        </h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verdeClaro, color: verdeOscuro }}>
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
                      (parseFloat(p.dosis) * tamanoTanque) / (ltsPorHa || 1);
                    return s + (isNaN(v) ? 0 : v);
                  }, 0)
                  .toFixed(2)}{" "}
                L
              </td>
              <td>
                {productos
                  .reduce((s, p) => {
                    const frac = litrosTotales % tamanoTanque;
                    const v = (parseFloat(p.dosis) * frac) / (ltsPorHa || 1);
                    return s + (isNaN(v) ? 0 : v);
                  }, 0)
                  .toFixed(2)}{" "}
                L
              </td>
            </tr>
          </tbody>
        </Table>

        <h5 style={{ color: verdeOscuro, marginTop: 24 }}>
          Total de agua en el tanque
        </h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verdeClaro, color: verdeOscuro }}>
              <th>Completo</th>
              <th>Fraccionado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                {(tamanoTanque - sumaProdCompleto).toFixed(2)} Lts
              </td>
              <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                {(fracVol - sumaProdFraccionado).toFixed(2)} Lts
              </td>
            </tr>
          </tbody>
        </Table>
        <h5 style={{ color: verdeOscuro }}>Productos Líquidos</h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verde, color: blanco }}>
              <th>Producto</th>
              <th>Dosis</th>
              <th>Unidad</th>
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
                  <td>{p.dosis}</td>
                  <td>{p.unidad}</td>
                  <td>{total.toFixed(1)} L</td>
                  <td>{calcularBidones(total, p.envase)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <h5 style={{ color: verdeOscuro }}>Productos Sólidos</h5>
        <Table size="sm" bordered>
          <thead>
            <tr style={{ background: verde, color: blanco }}>
              <th>Producto</th>
              <th>Dosis</th>
              <th>Unidad</th>
              <th>Total campo</th>
              <th>Bolsas</th>
            </tr>
          </thead>
          <tbody>
            {productosSolidos.map((p) => (
              <tr key={p.id}>
                <td>{p.producto || "—"}</td>
                <td>{p.dosis}</td>
                <td>{p.unidad}</td>
                <td>
                  {(parseFloat(p.dosis) * parseFloat(hectareas) || 0).toFixed(
                    1
                  )}
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
        <h5 style={{ color: verdeOscuro }}>Observaciones del usuario</h5>
        <p>{observacionesTexto || <i>No se ingresaron observaciones.</i>}</p>
        <h5 style={{ color: verdeOscuro }}>Condiciones sugeridas</h5>
        <ul>
          {suggestedLabels.map((label, idx) =>
            suggestedValues[idx] ? (
              <li key={label}>
                <b>{label}:</b> {suggestedValues[idx]}
              </li>
            ) : null
          )}
        </ul>
        <h5 style={{ color: verdeOscuro }}>Condiciones reales</h5>
        <ul>
          {realLabels.map((label, idx) =>
            realValues[idx] ? (
              <li key={label}>
                <b>{label}:</b> {realValues[idx]}
              </li>
            ) : null
          )}
        </ul>
        <hr />
        <p>
          <b>Explicación:</b>
          <br />
          Esta receta resume todos los insumos y condiciones que usted debe
          considerar para aplicar el caldo correctamente en su campo. Verifique
          las dosis, cantidades totales, fraccionamientos y condiciones
          climáticas antes de la aplicación. <br />
          <b>Importante:</b> Siga siempre las recomendaciones de seguridad y
          consulte a su asesor agronómico.
        </p>
      </div>
    );
  };

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

  useEffect(() => {
    const total = parseFloat(hectareas) * parseFloat(ltsPorHa);
    setLitrosTotales(isNaN(total) ? 0 : total);
  }, [hectareas, ltsPorHa]);

  // --- LÍQUIDOS ---
  const agregarProducto = () => {
    setProductos((prev) => [
      ...prev,
      { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "L" },
    ]);
  };
  const eliminarProducto = (id) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };
  const actualizarProducto = (id, campo, valor) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };
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
  const calcularTotalCampo = (dosis) => {
    const total = parseFloat(dosis) * parseFloat(hectareas);
    return isNaN(total) ? 0 : total;
  };
  const calcularBidones = (totalCampo, envase) => {
    if (!envase || parseFloat(envase) === 0) return "—";
    const bidones = parseFloat(totalCampo) / parseFloat(envase);
    return isNaN(bidones) ? "—" : bidones.toFixed(1);
  };

  // --- SÓLIDOS ---
  const agregarProductoSolido = () => {
    setProductosSolidos((prev) => [
      ...prev,
      { id: Date.now(), envase: "", producto: "", dosis: "", unidad: "Kg/ha" },
    ]);
  };
  const eliminarProductoSolido = (id) => {
    setProductosSolidos((prev) => prev.filter((p) => p.id !== id));
  };
  const actualizarProductoSolido = (id, campo, valor) => {
    setProductosSolidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  // --- OBSERVACIONES ---
  const limpiarObservaciones = () => {
    setObservacionesTexto("");
    setSuggestedValues(suggestedLabels.map(() => ""));
    setRealValues(realLabels.map(() => ""));
  };

  // --- CÁLCULOS ---
  const fracVol = litrosTotales % tamanoTanque;
  const sumaProdCompleto = productos.reduce((sum, p) => {
    const v = (parseFloat(p.dosis) * tamanoTanque) / (ltsPorHa || 1);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const sumaProdFraccionado = productos.reduce((sum, p) => {
    const v = (parseFloat(p.dosis) * fracVol) / (ltsPorHa || 1);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  // --- UI ---
  return (
    <Card
      className="mx-auto my-5 shadow calculadora-card"
      style={{
        maxWidth: "1160px",
        background: blanco,
        borderRadius: "1.4rem",
        border: "none",
        transform: "none",
        transition: "none"
      }}
    >
      <Card.Body>
        <Card.Title className="fw-bold mb-4" style={{ color: verdeOscuro }}>
          Calculadora de Caldos
        </Card.Title>
        {/* FORM PRINCIPAL */}
        <Form>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Total de hectáreas
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={hectareas}
                min={0}
                onChange={(e) => setHectareas(+e.target.value)}
                className="input-terrax"
              />
            </Col>
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Lts/Ha de caldo
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={ltsPorHa}
                min={0}
                onChange={(e) => setLtsPorHa(+e.target.value)}
                className="input-terrax"
              />
            </Col>
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Tamaño del tanque (L)
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={tamanoTanque}
                min={0}
                onChange={(e) => setTamanoTanque(+e.target.value)}
                className="input-terrax"
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Litros totales de caldo
              </Form.Label>
              <Form.Control
                readOnly
                value={litrosTotales.toFixed(0)}
                className="input-terrax"
                style={{ background: grisClaro, color: grisOscuro }}
              />
            </Col>
          </Row>
        </Form>
        {/* TABS */}
        <Tabs defaultActiveKey="liquidos" className="mb-3 tab-terrax">
          {/* TAB LÍQUIDOS */}
          <Tab
            eventKey="liquidos"
            title={<span style={{ color: "black" }}>Líquidos</span>}
          >

            <Row className="mb-4">
              <Col md={6}>
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Productos utilizados
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
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
                            className="input-terrax"
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
                            className="input-terrax"
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
                            className="input-terrax"
                          />
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={p.unidad}
                            onChange={(e) =>
                              actualizarProducto(p.id, "unidad", e.target.value)
                            }
                            className="input-terrax"
                          >
                            {UNIDADES.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </Form.Select>
                        </td>
                        <td>
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
                <Button
                  variant="success"
                  size="sm"
                  onClick={agregarProducto}
                  className="mt-2 rounded-pill px-3"
                >
                  <Plus size={14} /> Agregar producto
                </Button>
              </Col>
              <Col md={6}>
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Resumen automático
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
                      <th>Producto</th>
                      <th>Total campo</th>
                      <th>Total Envases</th>
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
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Tanques requeridos
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
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
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Litros por tanque
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
                      <th>Completo</th>
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

            {/* CANTIDADES POR TANQUE */}
            <Row className="mb-4">
              <Col md={6}>
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Por tanque completo
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
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
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Por tanque fraccionado
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
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

            {/* TOTALES DE PRODUCTO PURO */}
            <Row className="mb-4">
              <Col>
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Total de producto puro por tanque
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro text-center"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
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

            {/* AGUA EN EL TANQUE */}
            <Row className="mb-4">
              <Col>
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Total de agua en el tanque
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro text-center"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
                      <th>Completo</th>
                      <th>Fraccionado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                        {(tamanoTanque - sumaProdCompleto).toFixed(2)} Lts
                      </td>
                      <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                        {(fracVol - sumaProdFraccionado).toFixed(2)} Lts
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>

            {/* Botón Limpiar registros */}
            <Row>
              <Col className="text-end">
                <Button
                  variant="outline-success"
                  className="rounded-pill px-4 shadow-sm"
                  onClick={limpiarRegistros}
                  style={{
                    fontWeight: "bold",
                    borderColor: verde,
                  }}
                >
                  Limpiar registros
                </Button>
              </Col>
            </Row>
          </Tab>

          {/* TAB SÓLIDOS */}
          <Tab
            eventKey="solidos"
            title={<span style={{ color: "black" }}>Sólidos</span>}
          >
            <Row className="mb-4">
              <Col md={6}>
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Insumos sólidos
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
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
                            size="sm"
                            type="number"
                            value={p.envase}
                            onChange={(e) =>
                              actualizarProductoSolido(
                                p.id,
                                "envase",
                                e.target.value
                              )
                            }
                            className="input-terrax"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={p.producto}
                            onChange={(e) =>
                              actualizarProductoSolido(
                                p.id,
                                "producto",
                                e.target.value
                              )
                            }
                            className="input-terrax"
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="number"
                            value={p.dosis}
                            onChange={(e) =>
                              actualizarProductoSolido(
                                p.id,
                                "dosis",
                                e.target.value
                              )
                            }
                            className="input-terrax"
                          />
                        </td>
                        <td style={{ width: "80px", minWidth: "80px" }}>
                          <Form.Select
                            value={p.unidad}
                            onChange={(e) =>
                              actualizarProductoSolido(p.id, "unidad", e.target.value)
                            }
                            style={{
                              width: "120px",
                              minWidth: "120px",
                              height: "45px",
                              padding: "6px 34px 6px 12px",
                              fontWeight: 600,
                              textAlign: "center",
                            }}
                            className="input-terrax"
                          >
                            <option value="Kg/ha">Kg/ha</option>
                            <option value="g/ha">g/ha</option>
                          </Form.Select>
                        </td>

                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => eliminarProductoSolido(p.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button
                  variant="success"
                  size="sm"
                  onClick={agregarProductoSolido}
                  className="mt-2 rounded-pill px-3"
                >
                  <Plus size={14} /> Agregar línea
                </Button>
              </Col>
              <Col md={6}>
                <h5 className="mb-2" style={{ color: verdeOscuro }}>
                  Resumen sólidos
                </h5>
                <Table
                  size="sm"
                  bordered
                  className="table-terrax encabezado-claro"
                >
                  <thead>
                    <tr style={{ background: verde, color: blanco }}>
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
                  variant="outline-success"
                  className="rounded-pill px-4 shadow-sm"
                  onClick={limpiarRegistros}
                  style={{
                    fontWeight: "bold",
                    borderColor: verde,
                  }}
                >
                  Limpiar registros
                </Button>
              </Col>
            </Row>
          </Tab>

          {/* TAB OBSERVACIONES */}
          <Tab
            eventKey="observaciones"
            title={<span style={{ color: "black" }}>Observaciones</span>}
          >
            <Card className="mb-4 rounded-xl shadow-sm">
              <Card.Body>
                <h5 className="mb-3" style={{ color: verdeOscuro }}>
                  Observaciones
                </h5>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Escriba observaciones..."
                  value={observacionesTexto}
                  onChange={(e) => setObservacionesTexto(e.target.value)}
                  className="shadow-sm rounded input-terrax"
                />
              </Card.Body>
            </Card>
            <Row className="gx-4 gy-4 mb-4">
              {[
                {
                  title: "Condiciones sugeridas",
                  labels: suggestedLabels,
                  values: suggestedValues,
                  setValues: setSuggestedValues,
                },
                {
                  title: "Condiciones reales",
                  labels: realLabels,
                  values: realValues,
                  setValues: setRealValues,
                },
              ].map(({ title, labels, values, setValues }) => (
                <Col md={6} key={title}>
                  <Card className="condiciones-card rounded-xl shadow-sm h-100">
                    <Card.Header
                      style={{
                        background: verdeClaro,
                        color: verdeOscuro,
                        fontWeight: 600,
                        borderTopLeftRadius: "1rem",
                        borderTopRightRadius: "1rem",
                        borderBottom: "none",
                      }}
                    >
                      <h6 className="mb-0">{title}</h6>
                    </Card.Header>
                    <Card.Body className="p-2">
                      <Table
                        size="sm"
                        borderless
                        className="condiciones-table mb-0"
                      >
                        <tbody>
                          {labels.map((label, idx) => {
                            // Determinar tipo de campo y validación
                            let type = "number";
                            let min = 1;
                            let isInvalid = false;
                            let helper = "";

                            // CAMPO: Dirección viento (texto)
                            if (label.toLowerCase().includes("dirección")) {
                              type = "text";
                              min = undefined;
                            }

                            // CAMPO: Fecha (calendario)
                            if (label.toLowerCase().includes("fecha")) {
                              type = "date";
                              min = undefined;
                            }

                            // CAMPO: Hora (hora)
                            if (label.toLowerCase().includes("hora")) {
                              type = "time";
                              min = undefined;
                            }

                            // Validación de solo números positivos para los que correspondan
                            if (
                              type === "number" &&
                              values[idx] !== "" &&
                              (isNaN(Number(values[idx])) ||
                                Number(values[idx]) <= 0)
                            ) {
                              isInvalid = true;
                              helper = "Solo números mayores a cero";
                            }

                            return (
                              <tr key={label}>
                                <td
                                  className="fw-semibold"
                                  style={{
                                    width: "58%",
                                    color: verdeOscuro,
                                    background: "#f7faf9",
                                  }}
                                >
                                  {label}
                                </td>
                                <td>
                                  <Form.Control
                                    size="sm"
                                    className={`shadow-sm rounded input-terrax ${isInvalid ? "is-invalid" : ""
                                      }`}
                                    type={type}
                                    min={min}
                                    value={values[idx]}
                                    onChange={(e) => {
                                      const vals = [...values];
                                      vals[idx] = e.target.value;
                                      setValues(vals);
                                    }}
                                  />
                                  {isInvalid && (
                                    <div
                                      className="invalid-feedback"
                                      style={{ display: "block" }}
                                    >
                                      {helper}
                                    </div>
                                  )}
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
            <Row className="gx-3">
              <Col md={6}>
                <Button
                  className="btn-terrax-light w-100 d-flex align-items-center justify-content-center rounded-pill"
                  style={{
                    background: "#e9fbe5",
                    color: verdeOscuro,
                    border: `1px solid ${verde}`,
                    fontWeight: "bold",
                  }}
                  onClick={() => setShowResumen(true)}
                >
                  <i className="bi bi-filetype-pdf me-2" /> Generar Receta
                </Button>
              </Col>
              <Col md={6}>
                <Button
                  variant="outline-success"
                  className="w-100 d-flex align-items-center justify-content-center rounded-pill"
                  style={{
                    fontWeight: "bold",
                    borderColor: verde,
                  }}
                  onClick={limpiarObservaciones}
                >
                  <i className="bi bi-backspace me-2" /> Limpiar
                </Button>
              </Col>
            </Row>
            {/* MODAL DE RESUMEN */}
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
                {/* Poner el resumen en un ref, para html2pdf */}
                <div ref={resumenRef}>{getResumenText()}</div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="success"
                  className="rounded-pill"
                  onClick={handleDescargarPDF}
                >
                  <i className="bi bi-download me-2" /> Descargar PDF
                </Button>
                <Button
                  variant="outline-secondary"
                  className="rounded-pill"
                  onClick={() => setShowResumen(false)}
                >
                  Cerrar
                </Button>
              </Modal.Footer>
            </Modal>
            ;
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default Calculadora;