// src/components/TareasAgricolas/TrazabilidadAgricola.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import axios from "../../axiosconfig";
import "bootstrap-icons/font/bootstrap-icons.css";

dayjs.locale("es");

// Colores y etiquetas por tipo
const TYPE_META = {
  SIEMBRA:       { label: "Siembra",                bg: "#eaf7ec", dot: "#56a66a" },
  COBERTURA:     { label: "Cobertura",              bg: "#f7ecd8", dot: "#c49a54" },
  FERTILIZACION: { label: "Fertilización",          bg: "#efe2fb", dot: "#7f57c2" },
  MALEZAS:       { label: "Manejo de Malezas",      bg: "#fde7ef", dot: "#cf5f86" },
  LABOREO:       { label: "Laboreos de Lote",       bg: "#f1e7de", dot: "#a37a60" },
  RIEGO:         { label: "Riego",                  bg: "#e6f3fb", dot: "#5aa6d6" },
  FITOSANITARIA: { label: "Aplicación Fitosanitaria", bg: "#e8f2ea", dot: "#4f8f67" },
  COSECHA:       { label: "Cosecha",                bg: "#fff5d7", dot: "#cc9a00" },
  OTRA:          { label: "Tarea",                  bg: "#f3f5f7", dot: "#8792a1" },
};

// para mapear strings del backend -> claves de arriba
const mapTipo = (raw) => {
  const s = (raw || "").toString().toLowerCase();
  if (s.includes("siembr")) return "SIEMBRA";
  if (s.includes("cobert")) return "COBERTURA";
  if (s.includes("fertili")) return "FERTILIZACION";
  if (s.includes("maleza")) return "MALEZAS";
  if (s.includes("laboreo")) return "LABOREO";
  if (s.includes("riego")) return "RIEGO";
  if (s.includes("fitosan")) return "FITOSANITARIA";
  if (s.includes("cosech")) return "COSECHA";
  return "OTRA";
};

// campos conocidos para armar el mini-form de detalle
const FIELD_LABELS = {
  // comunes
  fecha: "Fecha",
  descripcion: "Descripción",
  observaciones: "Observaciones",
  // siembra / cobertura
  cultivo: "Cultivo",
  variedad: "Variedad",
  densidad: "Densidad",
  unidad_densidad: "Unidad",
  cultivo_cobertura: "Cultivo de cobertura",
  // riego
  tipo_riego: "Tipo de riego",
  volumen: "Volumen (mm)",
  // laboreo
  tipo_laboreo: "Tipo de laboreo",
  operario: "Operario",
  // fertilización / fitosanitaria / malezas
  tipo_fertilizante: "Tipo de fertilizante",
  de: "De",
  producto_aplicar: "Producto a aplicar",
  concentracion: "Concentración",
  fabricante: "Fabricante",
  litros_por_ha: "L/Kg por ha",
  hectareas_aplicadas: "Ha aplicadas",
  tipo_fitosanitario: "Tipo de fitosanitario",
  plaga_maleza: "Plaga / Maleza",
  lkg_por_ha: "L/Kg por ha",
  // cosecha
  rinde: "Rinde",
  unidad_rinde: "Unidad rinde",
};

const TIPO_OPTIONS = [
  { key: "", label: "Todos los tipos" },
  { key: "SIEMBRA", label: "Siembra" },
  { key: "COBERTURA", label: "Cobertura" },
  { key: "FERTILIZACION", label: "Fertilización" },
  { key: "MALEZAS", label: "Manejo de Malezas" },
  { key: "LABOREO", label: "Laboreos de Lote" },
  { key: "RIEGO", label: "Riego" },
  { key: "FITOSANITARIA", label: "Aplicación Fitosanitaria" },
  { key: "COSECHA", label: "Cosecha" },
];

export default function TrazabilidadAgricola() {
  // selects
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [campo, setCampo] = useState("");
  const [lote, setLote] = useState("");
  const [tipo, setTipo] = useState("");

  // fechas
  const [desde, setDesde] = useState(dayjs().subtract(12, "month").format("YYYY-MM-DD"));
  const [hasta, setHasta] = useState(dayjs().format("YYYY-MM-DD"));

  // datos
  const [rawEvents, setRawEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // filas expandidas (detalle)
  const [expanded, setExpanded] = useState(() => new Set());

  // cargar campos
  useEffect(() => {
    axios.get("/api/campos/").then((r) => setCampos(r.data)).catch(() => setCampos([]));
  }, []);

  // cargar lotes al elegir campo
  useEffect(() => {
    setLote("");
    if (!campo) return setLotes([]);
    axios
      .get(`/api/lotes/por-campo/${campo}/`)
      .then((r) => setLotes(r.data))
      .catch(() => setLotes([]));
  }, [campo]);

  const fetchEventos = async () => {
    if (!lote || !desde || !hasta) return;
    setLoading(true);
    try {
      const { data } = await axios.get("/api/trazabilidad/", {
        params: { lote, inicio: desde, fin: hasta },
      });
      const normalized = (Array.isArray(data) ? data : []).map((it, idx) => {
        const t = mapTipo(it.tipo);
        return {
          id: it.id || `${t}-${idx}-${it.fecha}`,
          tipo: t,
            // mostrar dd/mm/aaaa
          fecha: it.fecha,
          descripcion: it.descripcion || null,
          raw: it, // me guardo todo para detalle
        };
      });
      setRawEvents(normalized);
      setExpanded(new Set()); // colapso todo
    } catch (e) {
      console.error(e);
      setRawEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // al montar: si hay lote en URL podrías pre-cargar; por ahora esperamos al click “Buscar”

  const filtered = useMemo(() => {
    const arr = rawEvents.filter((ev) => (tipo ? ev.tipo === tipo : true));
    // orden cronológico ascendente
    return arr.sort((a, b) => {
      const da = dayjs(a.fecha);
      const db = dayjs(b.fecha);
      return da.valueOf() - db.valueOf();
    });
  }, [rawEvents, tipo]);

  const toggleRow = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // arma campos legibles para el mini-form (toma del raw original)
  const buildDetailPairs = (ev) => {
    const r = ev?.raw || {};
    const pairs = [];

    // pongo fecha primero
    if (r.fecha) pairs.push(["fecha", dayjs(r.fecha).format("DD/MM/YYYY")]);

    // según tipo, priorizo algunos campos
    const preferredByType = {
      SIEMBRA: ["cultivo", "variedad", "densidad", "unidad_densidad", "observaciones"],
      COBERTURA: ["cultivo_cobertura", "variedad", "densidad", "unidad_densidad", "observaciones"],
      RIEGO: ["tipo_riego", "volumen", "observaciones"],
      LABOREO: ["tipo_laboreo", "operario", "observaciones"],
      FERTILIZACION: [
        "tipo_fertilizante",
        "de",
        "producto_aplicar",
        "concentracion",
        "fabricante",
        "litros_por_ha",
        "hectareas_aplicadas",
        "observaciones",
      ],
      MALEZAS: [
        "tipo_fitosanitario",
        "plaga_maleza",
        "producto_aplicar",
        "fabricante",
        "lkg_por_ha",
        "hectareas_aplicadas",
        "observaciones",
      ],
      FITOSANITARIA: ["producto_aplicar", "plaga_maleza", "observaciones"],
      COSECHA: ["rinde", "unidad_rinde", "observaciones"],
      OTRA: ["descripcion", "observaciones"],
    };

    const keys = preferredByType[ev.tipo] || ["descripcion", "observaciones"];
    keys.forEach((k) => {
      if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== "") {
        pairs.push([k, String(r[k])]);
      }
    });

    // si quedó vacío, al menos muestro la descripción
    if (pairs.length <= 1 && r.descripcion) {
      pairs.push(["descripcion", r.descripcion]);
    }

    return pairs;
  };

  return (
    <Card
      className="mx-auto my-4 shadow"
      style={{
        maxWidth: 1200,
        border: "none",
        borderRadius: "1.25rem",
        background: "#ffffff", // tarjeta BLANCA
      }}
    >
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Card.Title className="m-0 fw-bold" style={{ color: "#16543a", fontSize: 22 }}>
            Trazabilidad Agrícola
          </Card.Title>
          <div className="ms-auto">
            <Link to="/tareas" className="btn btn-outline-success rounded-pill">
              <i className="bi bi-arrow-left-short me-1" />
              Volver a Tareas
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <Row className="g-3 mb-3">
          <Col md={4}>
            <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>
              Campo
            </Form.Label>
            <Form.Select
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
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
            <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>
              Lote
            </Form.Label>
            <Form.Select
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              disabled={!campo}
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
            <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>
              Tipo
            </Form.Label>
            <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPO_OPTIONS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col md={4}>
            <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>
              Desde
            </Form.Label>
            <Form.Control
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>
              Hasta
            </Form.Label>
            <Form.Control
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </Col>
          <Col md={4} className="d-flex align-items-end gap-2">
            <Button
              onClick={fetchEventos}
              className="rounded-pill px-4"
              style={{ background: "#198754", borderColor: "#198754", fontWeight: 600 }}
              disabled={loading || !lote}
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button
              variant="outline-secondary"
              className="rounded-pill px-3"
              onClick={() => {
                setTipo("");
                setRawEvents([]);
                setExpanded(new Set());
              }}
            >
              Limpiar
            </Button>
          </Col>
        </Row>

        {/* Tabla */}
        <div className="table-responsive">
          <Table bordered hover className="align-middle mb-0">
            <thead style={{ background: "#e9f6ee" }}>
              <tr>
                <th style={{ width: 140 }}>Fecha</th>
                <th style={{ width: 220 }}>Tipo</th>
                <th>Descripción</th>
                <th style={{ width: 90 }} className="text-center">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    {loading ? "Cargando…" : "No hay eventos en el rango seleccionado."}
                  </td>
                </tr>
              )}

              {filtered.map((ev) => {
                const meta = TYPE_META[ev.tipo] || TYPE_META.OTRA;
                const isOpen = expanded.has(ev.id);
                return (
                  <React.Fragment key={ev.id}>
                    <tr style={{ background: meta.bg }}>
                      <td className="fw-semibold">
                        {ev.fecha ? dayjs(ev.fecha).format("DD/MM/YYYY") : "-"}
                      </td>
                      <td>
                        <span
                          className="me-2 d-inline-block"
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: meta.dot,
                            transform: "translateY(-1px)",
                          }}
                        />
                        <Badge bg="success" style={{ background: meta.dot }}>
                          {meta.label}
                        </Badge>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 700 }}>
                        {ev.descripcion || <span className="text-muted">—</span>}
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="rounded-circle"
                          style={{ width: 34, height: 34, borderWidth: 2 }}
                          onClick={() => toggleRow(ev.id)}
                          title={isOpen ? "Ocultar detalle" : "Ver detalle"}
                        >
                          <i
                            className={`bi ${
                              isOpen ? "bi-chevron-compact-up" : "bi-chevron-compact-down"
                            }`}
                          />
                        </Button>
                      </td>
                    </tr>

                    {/* Detalle expandible */}
                    {isOpen && (
                      <tr>
                        <td colSpan={4} style={{ background: "#fafdfb" }}>
                          <div
                            className="p-3 border rounded-3"
                            style={{ borderColor: "#d9efe3", background: "#ffffff" }}
                          >
                            <Row className="g-3">
                              {buildDetailPairs(ev).map(([k, v]) => (
                                <Col md={6} key={k}>
                                  <Form.Label className="text-muted small mb-1">
                                    {FIELD_LABELS[k] || k}
                                  </Form.Label>
                                  <Form.Control
                                    size="sm"
                                    value={v}
                                    readOnly
                                    style={{ background: "#f7faf9" }}
                                  />
                                </Col>
                              ))}
                            </Row>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
