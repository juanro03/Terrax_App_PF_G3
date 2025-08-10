import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  ButtonGroup,
} from "react-bootstrap";
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
  "Aplicación Fitosanitaria",
];

export default function ActividadesAgricolas() {
  const [campo, setCampo] = useState("");
  const [lote, setLote] = useState("");
  const [actividad, setActividad] = useState("");
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [rows, setRows] = useState([]);
  // Vista para Fertilización: 'variable' (primera tabla) o 'fija' (segunda)
  const [fertVista, setFertVista] = useState("variable");

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
    console.log({ campo, lote, actividad, fertVista, rows });
    // Para enviar archivos: usar FormData (multipart)
    // const fd = new FormData();
    // fd.append("campo", campo);
    // fd.append("lote", lote);
    // fd.append("actividad", actividad);
    // fd.append("fertVista", fertVista);
    // rows.forEach((r, idx) => {
    //   Object.entries(r).forEach(([k, v]) => {
    //     if (v !== undefined && v !== null) fd.append(`rows[${idx}][${k}]`, v);
    //   });
    // });
    // await axios.post("/api/actividades/", fd, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
  };

  const limpiarRows = () => setRows([]);

  const addRow = () => {
    // Base
    let nuevaFila = {
      lote,
      fecha: "",
      maquinaria: "",
      mapa: false,
    };

    if (actividad === "Fertilización") {
      if (fertVista === "variable") {
        // Dosis Variable (con archivo)
        nuevaFila = {
          ...nuevaFila,
          tipoFertilizante: "",
          de: "",
          productoAplicar: "",
          concentracion: "",
          fabricante: "",
          litrosPorHa: "",
          hectareasAplicadas: "",
          mapaAdjunto: null, // SOLO en variable
          observaciones: "",
        };
      } else {
        // Dosis Fija (sin archivo)
        nuevaFila = {
          ...nuevaFila,
          tipoFertilizante: "",
          de: "",
          productoAplicar: "",
          concentracion: "",
          fabricante: "",
          litrosPorHa: "",
          hectareasAplicadas: "",
          observaciones: "",
        };
      }
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

  // Encabezados de tabla
  const renderHeaders = () => {
    if (actividad === "Fertilización") {
      const comunes = ["ID Lote", "Fecha"];
      const base = [
        "Tipo de fertilizante",
        "De",
        "Producto a aplicar",
        "Concentración",
        "Fabricante",
        "L/Kg por Ha",
        "Ha aplicadas",
      ];
      const extraVar = fertVista === "variable" ? ["Mapa adjunto"] : [];
      return [...comunes, ...base, ...extraVar, "Observaciones", ""];
    }

    if (actividad === "Aplicación Fitosanitaria") {
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
    }

    return ["Lote", "Fecha", "Maquinaria", "Mapa", "Observaciones", ""];
  };

  // Celdas de fila
  const renderCells = (r, i) => {
    const idCol = <td key="index">{i + 1}</td>;
    const fechaCol = (
      <td key="fecha">
        <Form.Control
          size="sm"
          type="date"
          value={r.fecha || ""}
          onChange={(e) => updateRow(i, "fecha", e.target.value)}
          className="input-terrax"
        />
      </td>
    );

    if (actividad === "Fertilización") {
      // Columnas comunes a ambas vistas
      const comunes = [
        idCol,
        fechaCol,
        <td key="tipoFert">
          <Form.Control
            size="sm"
            value={r.tipoFertilizante || ""}
            onChange={(e) => updateRow(i, "tipoFertilizante", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td key="de">
          <Form.Control
            size="sm"
            value={r.de || ""}
            onChange={(e) => updateRow(i, "de", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td key="productoAplicar">
          <Form.Control
            size="sm"
            value={r.productoAplicar || ""}
            onChange={(e) => updateRow(i, "productoAplicar", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td key="concentracion">
          <Form.Control
            size="sm"
            value={r.concentracion || ""}
            onChange={(e) => updateRow(i, "concentracion", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td key="fabricante">
          <Form.Control
            size="sm"
            value={r.fabricante || ""}
            onChange={(e) => updateRow(i, "fabricante", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td key="litrosPorHa">
          <Form.Control
            size="sm"
            value={r.litrosPorHa || ""}
            onChange={(e) => updateRow(i, "litrosPorHa", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td key="hectareasAplicadas">
          <Form.Control
            size="sm"
            value={r.hectareasAplicadas || ""}
            onChange={(e) => updateRow(i, "hectareasAplicadas", e.target.value)}
            className="input-terrax"
          />
        </td>,
      ];

      // Solo en Dosis Variable: Mapa adjunto (input chico)
      const mapaAdjunto =
        fertVista === "variable"
          ? [
              <td key="mapaAdjunto">
                <Form.Control
                  size="sm"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{
                    padding: "3px 4px",
                    fontSize: "0.7rem",
                    height: "25px",
                  }}
                  onChange={(e) =>
                    updateRow(
                      i,
                      "mapaAdjunto",
                      e.target.files && e.target.files[0]
                        ? e.target.files[0]
                        : null
                    )
                  }
                />
                {r.mapaAdjunto && (
                  <small className="text-muted">{r.mapaAdjunto.name}</small>
                )}
              </td>,
            ]
          : [];

      return [
        ...comunes,
        ...mapaAdjunto,
        <td key="observaciones">
          <Form.Control
            size="sm"
            value={r.observaciones || ""}
            onChange={(e) => updateRow(i, "observaciones", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td key="acciones" className="text-center">
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
        fechaCol,
        <td>
          <Form.Control
            size="sm"
            value={r.porcentaje || ""}
            onChange={(e) => updateRow(i, "porcentaje", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.plaga || ""}
            onChange={(e) => updateRow(i, "plaga", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.estadoFen || ""}
            onChange={(e) => updateRow(i, "estadoFen", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.producto || ""}
            onChange={(e) => updateRow(i, "producto", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.maquinaria || ""}
            onChange={(e) => updateRow(i, "maquinaria", e.target.value)}
            className="input-terrax"
          />
        </td>,
        <td className="text-center">
          <Form.Check
            checked={!!r.mapa}
            onChange={(e) => updateRow(i, "mapa", e.target.checked)}
          />
        </td>,
        <td>
          <Form.Control
            size="sm"
            value={r.observaciones || ""}
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

    // Default
    return [
      <td>{i + 1}</td>,
      fechaCol,
      <td>
        <Form.Control
          size="sm"
          value={r.maquinaria || ""}
          onChange={(e) => updateRow(i, "maquinaria", e.target.value)}
          className="input-terrax"
        />
      </td>,
      <td className="text-center">
        <Form.Check
          checked={!!r.mapa}
          onChange={(e) => updateRow(i, "mapa", e.target.checked)}
        />
      </td>,
      <td>
        <Form.Control
          size="sm"
          value={r.observaciones || ""}
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
              {campo && lotes.length === 0 && (
                <div
                  style={{
                    color: "#d9534f",
                    marginTop: "6px",
                    fontSize: "0.95rem",
                  }}
                >
                  No hay lotes asociados a este campo.
                </div>
              )}
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
                  const val = e.target.value;
                  setActividad(val);
                  setRows([]);
                  if (val === "Fertilización") setFertVista("variable");
                }}
                required
                className="input-terrax"
                disabled={lotes.length === 0}
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

          {actividad && (
            <div className="mt-5">
              {/* Cabecera solo con selector de vista para Fertilización */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 style={{ color: verdeOscuro, margin: 0 }}>
                  {actividad}
                  {actividad === "Fertilización" &&
                    (fertVista === "variable"
                      ? " · Dosis Variable"
                      : " · Dosis Fija")}
                </h5>

                {actividad === "Fertilización" && (
                  <ButtonGroup>
                    <Button
                      size="sm"
                      variant={
                        fertVista === "variable" ? "success" : "outline-success"
                      }
                      onClick={() => {
                        setFertVista("variable");
                        setRows([]);
                      }}
                    >
                      Dosis Variable
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        fertVista === "fija" ? "success" : "outline-success"
                      }
                      onClick={() => {
                        setFertVista("fija");
                        setRows([]);
                      }}
                    >
                      Dosis Fija
                    </Button>
                  </ButtonGroup>
                )}
              </div>

              {/* Tabla */}
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

              {/* Botones abajo de la tabla */}
              <div className="d-flex align-items-center mt-2">
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
                  className="rounded-pill px-3 ms-2"
                  onClick={limpiarRows}
                >
                  Limpiar
                </Button>

                {/* Submit a la derecha */}
                <div className="ms-auto">
                  <Button
                    type="submit"
                    className="rounded-pill px-4 shadow-sm"
                    style={{
                      fontWeight: "bold",
                      background: verde,
                      borderColor: verde,
                    }}
                    disabled={rows.length === 0}
                  >
                    Registrar Actividad
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
}
