import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Table } from "react-bootstrap";
import axios from "../../axiosconfig";
import "bootstrap-icons/font/bootstrap-icons.css";

// PALETA DE COLORES
const verde = "#198754";
const verdeClaro = "#e9fbe5";
const verdeOscuro = "#155a36";
const grisClaro = "#f3f6f5";
const blanco = "#fff";
const grisOscuro = "#424242";

const actividades = [
  "Fertilización",
  "Manejo de suelo",
  "Riego",
  "Pulverización",
  "Aplicación Fitosanitaria",
];

export default function ActividadesAgricolas() {
  const [campo, setCampo] = useState("");
  const [lote, setLote] = useState("");
  const [actividad, setActividad] = useState("");
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("/api/campos/")
      .then((res) => setCampos(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!campo) return setLotes([]);
    axios
      .get(`/api/lotes/por-campo/${campo}/`)
      .then((res) => setLotes(res.data))
      .catch(() => setLotes([]));
  }, [campo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ campo, lote, actividad, rows });
  };

  const limpiarRows = () => setRows([]);

  const addRow = () => {
    let nuevaFila = {
      lote,
      fecha: "",
      maquinaria: "",
      mapa: false,
    };

    if (actividad === "Fertilización") {
      nuevaFila = {
        ...nuevaFila,
        tipoFertilizante: "",
        numZonas: "",
        tipoCultivo: "",
        variedad: "",
        productoApp: "",
        cantidad: "",
      };
    } else if (actividad === "Aplicación Fitosanitaria") {
      nuevaFila = {
        ...nuevaFila,
        porcentaje: "",
        plaga: "",
        estadoFen: "",
        producto: "",
        observaciones: "",
      };
    } else {
      nuevaFila = { ...nuevaFila, observaciones: "" };
    }

    setRows((prev) => [...prev, nuevaFila]);
  };

  const updateRow = (idx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const eliminarRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const renderHeaders = () => {
    switch (actividad) {
      case "Fertilización":
        return [
          "Lote",
          "Fecha",
          "Tipo Fertilizante",
          "Zonas",
          "Tipo Cultivo",
          "Variedad",
          "Producto",
          "Maquinaria",
          "Cantidad",
          "Mapa",
          "",
        ];
      case "Aplicación Fitosanitaria":
        return [
          "Lote",
          "Fecha",
          "% Afectado",
          "Plaga",
          "Estado Fenológico",
          "Producto",
          "Maquinaria",
          "Mapa",
          "Observaciones",
          "",
        ];
      default:
        return ["Lote", "Fecha", "Maquinaria", "Mapa", "Observaciones", ""];
    }
  };

  const renderCells = (r, i) => {
    const base = [
      <td key="fecha">
        <Form.Control
          size="sm"
          type="date"
          value={r.fecha}
          onChange={(e) => updateRow(i, "fecha", e.target.value)}
          className="input-terrax"
        />
      </td>,
    ];

    if (actividad === "Fertilización") {
      return [
        <td key="index">{i + 1}</td>,
        ...base,
        <td>
          <Form.Control
            size="sm"
            value={r.tipoFertilizante}
            onChange={(e) => updateRow(i, "tipoFertilizante", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            type="number"
            value={r.numZonas}
            onChange={(e) => updateRow(i, "numZonas", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.tipoCultivo}
            onChange={(e) => updateRow(i, "tipoCultivo", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.variedad}
            onChange={(e) => updateRow(i, "variedad", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.productoApp}
            onChange={(e) => updateRow(i, "productoApp", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.maquinaria}
            onChange={(e) => updateRow(i, "maquinaria", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.cantidad}
            onChange={(e) => updateRow(i, "cantidad", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td className="text-center">
          <Form.Check
            checked={r.mapa}
            onChange={(e) => updateRow(i, "mapa", e.target.checked)}
          />
        </td>,
        <td className="text-center">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => eliminarRow(i)}
          >
            <i className="bi bi-trash" />
          </Button>
        </td>,
      ];
    }

    if (actividad === "Aplicación Fitosanitaria") {
      return [
        <td>{i + 1}</td>,
        ...base,
        <td>
          <Form.Control
            size="sm"
            value={r.porcentaje}
            onChange={(e) => updateRow(i, "porcentaje", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.plaga}
            onChange={(e) => updateRow(i, "plaga", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.estadoFen}
            onChange={(e) => updateRow(i, "estadoFen", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.producto}
            onChange={(e) => updateRow(i, "producto", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.maquinaria}
            onChange={(e) => updateRow(i, "maquinaria", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td className="text-center">
          <Form.Check
            checked={r.mapa}
            onChange={(e) => updateRow(i, "mapa", e.target.checked)}
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.observaciones}
            onChange={(e) => updateRow(i, "observaciones", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td className="text-center">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => eliminarRow(i)}
          >
            <i className="bi bi-trash" />
          </Button>
        </td>,
      ];
    }

    // Default para las otras actividades
    return [
      <td>{i + 1}</td>,
      ...base,
      <td>
        <Form.Control
          size="sm"
          value={r.maquinaria}
          onChange={(e) => updateRow(i, "maquinaria", e.target.value)}
          className="input-terrax"
        />
      </td>,
      <td className="text-center">
        <Form.Check
          checked={r.mapa}
          onChange={(e) => updateRow(i, "mapa", e.target.checked)}
        />
      </td>,
      <td>
        <Form.Control
          size="sm"
          value={r.observaciones}
          onChange={(e) => updateRow(i, "observaciones", e.target.value)}
          className="input-terrax"
        />
      </td>,
      <td className="text-center">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => eliminarRow(i)}
        >
          <i className="bi bi-trash" />
        </Button>
      </td>,
    ];
  };

  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{
        maxWidth: "1160px",
        background: blanco,
        borderRadius: "1.4rem",
        border: "none",
      }}
    >
      <Card.Body>
        <Card.Title className="fw-bold mb-4" style={{ color: verdeOscuro }}>
          Registrar Actividad Agrícola
        </Card.Title>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Campo
              </Form.Label>
              <Form.Select
                value={campo}
                onChange={(e) => {
                  setCampo(e.target.value);
                  setLote("");
                }}
                required
                className="input-terrax"
              >
                <option value="">Seleccione un campo</option>
                {campos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Lote
              </Form.Label>
              <Form.Select
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                disabled={!campo}
                required
                className="input-terrax"
              >
                <option value="">Seleccione un lote</option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label
                className="fw-semibold"
                style={{ color: verdeOscuro }}
              >
                Actividad
              </Form.Label>
              <Form.Select
                value={actividad}
                onChange={(e) => {
                  setActividad(e.target.value);
                  setRows([]);
                }}
                required
                className="input-terrax"
              >
                <option value="">Seleccione actividad</option>
                {actividades.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <div className="text-end mt-3">
            <Button
              type="submit"
              className="rounded-pill px-4 shadow-sm"
              style={{
                fontWeight: "bold",
                background: verde,
                borderColor: verde,
              }}
            >
              Registrar Actividad
            </Button>
          </div>
        </Form>

        {actividad && (
          <div className="mt-5">
            <h5 style={{ color: verdeOscuro }}>{actividad}</h5>
            <div className="d-flex justify-content-between mb-2">
              <Button
                size="sm"
                variant="success"
                className="rounded-pill px-3"
                onClick={addRow}
              >
                + Agregar fila
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                className="rounded-pill px-3"
                onClick={limpiarRows}
              >
                Limpiar
              </Button>
            </div>
            <Table
              bordered
              hover
              size="sm"
              className="table-terrax encabezado-claro"
            >
              <thead>
                <tr style={{ background: verde, color: blanco }}>
                  {renderHeaders().map((h, idx) => (
                    <th key={idx}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>{renderCells(r, i)}</tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
