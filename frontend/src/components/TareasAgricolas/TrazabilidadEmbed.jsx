// src/components/TareasAgricolas/TrazabilidadEmbed.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Row, Col, Form, Button, Table, Modal } from "react-bootstrap";
import dayjs from "dayjs";
import "dayjs/locale/es";
import axios from "../../axiosconfig";
import "bootstrap-icons/font/bootstrap-icons.css";
dayjs.locale("es");

// ---------- Helpers de endpoints (editar / borrar) ----------
const getEndpointFor = (model, id) => {
  if (!model || id == null) return null;
  const m = String(model).toLowerCase();
  switch (m) {
    case "tarea":
    case "tareas":
      return `/api/tareas/${encodeURIComponent(id)}/`;
    case "siembra":
    case "siembras":
      return `/api/siembras/${encodeURIComponent(id)}/`;
    case "riego":
    case "riegos":
      return `/api/riegos/${encodeURIComponent(id)}/`;
    case "laboreo":
    case "laboreos":
      return `/api/laboreos/${encodeURIComponent(id)}/`;
    case "maleza":
    case "malezas":
      return `/api/malezas/${encodeURIComponent(id)}/`;
    case "fitosanitaria":
    case "aplicacion_fitosanitaria":
      return `/api/fitosanitarias/${encodeURIComponent(id)}/`;
    case "cosecha":
    case "cosechas":
      return `/api/cosechas/${encodeURIComponent(id)}/`;
    default:
      return null;
  }
};

// ---------- Meta UI ----------
const TYPE_META = {
  SIEMBRA: { label: "Siembra", bg: "#eaf7ec", dot: "#56a66a" },
  COBERTURA: { label: "Cobertura", bg: "#f7ecd8", dot: "#c49a54" },
  FERTILIZACION: { label: "Fertilización", bg: "#efe2fb", dot: "#7f57c2" },
  MALEZAS: { label: "Manejo de Malezas", bg: "#fde7ef", dot: "#cf5f86" },
  LABOREO: { label: "Laboreos de Lote", bg: "#f1e7de", dot: "#a37a60" },
  RIEGO: { label: "Riego", bg: "#e6f3fb", dot: "#5aa6d6" },
  FITOSANITARIA: { label: "Aplicación Fitosanitaria", bg: "#e8f2ea", dot: "#4f8f67" },
  COSECHA: { label: "Cosecha", bg: "#fff5d7", dot: "#cc9a00" },
  OTRA: { label: "Tarea", bg: "#f3f5f7", dot: "#8792a1" },
};

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

const FIELD_LABELS = {
  fecha: "Fecha",
  descripcion: "Descripción",
  observaciones: "Observaciones",
  cultivo: "Cultivo",
  variedad: "Variedad",
  densidad: "Densidad",
  unidad_densidad: "Unidad",
  cultivo_cobertura: "Cultivo de cobertura",
  tipo_riego: "Tipo de riego",
  volumen: "Volumen (mm)",
  tipo_laboreo: "Tipo de laboreo",
  operario: "Operario",
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
  rinde: "Rinde",
  unidad_rinde: "Unidad rinde",
};

const TIPO_OPTIONS = [
  { key: "", label: "Todos" },
  { key: "SIEMBRA", label: "Siembra" },
  { key: "COBERTURA", label: "Cobertura" },
  { key: "FERTILIZACION", label: "Fertilización" },
  { key: "MALEZAS", label: "Manejo de Malezas" },
  { key: "LABOREO", label: "Laboreos de Lote" },
  { key: "RIEGO", label: "Riego" },
  { key: "FITOSANITARIA", label: "Aplicación Fitosanitaria" },
  { key: "COSECHA", label: "Cosecha" },
];

// campos editables según tipo
const EDITABLE_BY_TYPE = {
  SIEMBRA: ["cultivo", "variedad", "densidad", "unidad_densidad", "observaciones", "descripcion"],
  COBERTURA: ["cultivo_cobertura", "variedad", "densidad", "unidad_densidad", "observaciones", "descripcion"],
  RIEGO: ["tipo_riego", "volumen", "observaciones", "descripcion"],
  LABOREO: ["tipo_laboreo", "operario", "observaciones", "descripcion"],
  FERTILIZACION: [
    "tipo_fertilizante", "de", "producto_aplicar", "concentracion", "fabricante",
    "litros_por_ha", "hectareas_aplicadas", "observaciones", "descripcion",
  ],
  MALEZAS: [
    "tipo_fitosanitario", "plaga_maleza", "producto_aplicar", "fabricante",
    "lkg_por_ha", "hectareas_aplicadas", "observaciones", "descripcion",
  ],
  FITOSANITARIA: ["producto_aplicar", "plaga_maleza", "observaciones", "descripcion"],
  COSECHA: ["rinde", "unidad_rinde", "observaciones", "descripcion"],
  OTRA: ["descripcion", "observaciones"],
};

const NUMERIC_KEYS = new Set([
  "volumen", "litros_por_ha", "hectareas_aplicadas", "lkg_por_ha", "rinde", "densidad",
]);

const pickServerId = (o = {}) =>
  o.source_pk ?? o.pk ?? o.uuid ?? o.tarea_id ?? o.task_id ?? o.tarea ?? o.id ?? null;

// calcula si el texto debe ser blanco o negro para contrastar con el fondo
const textColorFor = (hex) => {
  try {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // luminancia relativa
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return L > 0.7 ? "#1f2937" : "#ffffff"; // fondo claro -> texto oscuro
  } catch {
    return "#ffffff";
  }
};

export default function TrazabilidadEmbed({
  campos: camposProp,
  lotes: lotesProp,
  campo: campoProp,
  setCampo: setCampoProp,
  lote: loteProp,
  setLote: setLoteProp,
  refreshKey
}) {
  // filtros
  const [campos, setCampos] = useState(camposProp || []);
  const [lotes, setLotes] = useState(lotesProp || []);
  const [campo, setCampo] = useState(campoProp || "");
  const [lote, setLote] = useState(loteProp || "");
  const [tipo, setTipo] = useState("");

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");


  // data
  const [allTasks, setAllTasks] = useState([]);   // /api/tareas/
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());

  // edición
  const [editOpen, setEditOpen] = useState(false);
  const [editEv, setEditEv] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // sync selects del padre
  useEffect(() => { if (Array.isArray(camposProp)) setCampos(camposProp); }, [camposProp]);
  useEffect(() => { if (Array.isArray(lotesProp)) setLotes(lotesProp); }, [lotesProp]);
  useEffect(() => { if (campoProp !== undefined) setCampo(campoProp); }, [campoProp]);
  useEffect(() => { if (loteProp !== undefined) setLote(loteProp); }, [loteProp]);

  // cargar listas si no vienen por props
  useEffect(() => {
    if (camposProp) return;
    axios.get("/api/campos/").then((r) => setCampos(r.data)).catch(() => setCampos([]));
  }, [camposProp]);

  useEffect(() => {

    setLotes([]); // limpiar para evitar ver lotes viejos
    if (!campo) return;
    const fetchLotes = async () => {
      try {
        const { data } = await axios.get(`/api/lotes/por-campo/${campo}/`);
        setLotes(data || []);
        const loteIds = new Set((data || []).map((l) => String(l.id)));
        if (!loteIds.has(String(lote))) {
          setLote("");
        }
      }
      catch {
        setLotes([]);
        setLote("");
      }
    };
    fetchLotes();
  }, [campo]);


  useEffect(() => {
    if (!campo) setLote(""); // si el campo vuelve a "Todos", resetea lote
  }, [campo]);



  // normalizador
  const normalizeFromTarea = (it, idx) => {
    const t = mapTipo(it.tipo);
    const serverId = pickServerId(it);
    return {
      id: `tarea-${serverId ?? idx}-${it.fecha ?? idx}`,
      serverId,
      serverModel: "tarea",
      tipo: t,
      fecha: it.fecha,
      raw: it,
    };
  };

  // carga inicial: TODAS
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/tareas/");
        const normalized = (Array.isArray(data) ? data : []).map(normalizeFromTarea);
        setAllTasks(normalized);
        setExpanded(new Set());
      } catch (e) {
        console.error(e);
        setAllTasks([]);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [refreshKey]);

  // filtrado local
  const filtered = useMemo(() => {
    const dDesde = desde ? dayjs(desde).startOf("day") : null;
    const dHasta = hasta ? dayjs(hasta).endOf("day") : null;

    return allTasks
      .filter((ev) => {
        // tipo
        if (tipo && ev.tipo !== tipo) return false;

        // campo
        if (campo && lotes.length > 0) {
          const loteId = ev?.raw?.lote ?? ev?.raw?.lote_id ?? null;
          const lotesDeCampo = new Set(lotes.map((l) => String(l.id)));
          if (!lotesDeCampo.has(String(loteId))) return false;
        }

        // lote
        if (lote) {
          const loteId = String(ev?.raw?.lote ?? ev?.raw?.lote_id ?? "");
          if (String(loteId) !== String(lote)) return false;
        }

        // fechas
        if (dDesde || dHasta) {
          const f = ev.fecha ? dayjs(ev.fecha) : null;
          if (!f) return false;
          if (dDesde && f.isBefore(dDesde)) return false;
          if (dHasta && f.isAfter(dHasta)) return false;
        }

        return true;
      })
      .sort((a, b) => dayjs(a.fecha).valueOf() - dayjs(b.fecha).valueOf());
  }, [allTasks, tipo, campo, lote, desde, hasta, lotes]);


  // helpers UI
  const toggleRow = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const buildDetailPairs = (ev) => {
    const r = ev?.raw || {};
    const pairs = [];
    if (r.fecha) pairs.push(["fecha", dayjs(r.fecha).format("DD/MM/YYYY")]);

    const preferredByType = {
      SIEMBRA: ["cultivo", "variedad", "densidad", "unidad_densidad", "observaciones"],
      COBERTURA: ["cultivo_cobertura", "variedad", "densidad", "unidad_densidad", "observaciones"],
      RIEGO: ["tipo_riego", "volumen", "observaciones"],
      LABOREO: ["tipo_laboreo", "operario", "observaciones"],
      FERTILIZACION: [
        "tipo_fertilizante", "de", "producto_aplicar", "concentracion", "fabricante",
        "litros_por_ha", "hectareas_aplicadas", "observaciones",
      ],
      MALEZAS: [
        "tipo_fitosanitario", "plaga_maleza", "producto_aplicar", "fabricante",
        "lkg_por_ha", "hectareas_aplicadas", "observaciones",
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
    return pairs;
  };

  // selects controlados opcionalmente por el padre
  const onCampoChange = (v) => (setCampoProp ? setCampoProp(v) : setCampo(v));
  const onLoteChange = (v) => (setLoteProp ? setLoteProp(v) : setLote(v));

  // ---------- Editar / Borrar ----------
  const openEdit = (ev) => {
    const r = ev.raw || {};
    const keys = EDITABLE_BY_TYPE[ev.tipo] || EDITABLE_BY_TYPE.OTRA;
    const base = { fecha: r.fecha ? dayjs(r.fecha).format("YYYY-MM-DD") : "" };
    const dynamic = {};
    keys.forEach((k) => { dynamic[k] = r[k] ?? ""; });
    setEditEv(ev);
    setEditForm({ ...base, ...dynamic });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editEv?.serverId || !editEv?.serverModel) { setEditOpen(false); return; }
    const url = getEndpointFor(editEv.serverModel, editEv.serverId);
    if (!url) { alert("Este tipo de evento no se puede editar desde aquí."); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v ?? ""));
      await axios.patch(url, fd, { headers: { "Content-Type": "multipart/form-data" } });

      setAllTasks((prev) =>
        prev.map((ev) => {
          if (ev.id !== editEv.id) return ev;
          const newRaw = { ...ev.raw, ...editForm, fecha: editForm.fecha || ev.raw.fecha };
          return { ...ev, fecha: newRaw.fecha, raw: newRaw };
        })
      );
      setEditOpen(false);
    } catch (err) {
      try {
        const fd = new FormData();
        Object.entries(editForm).forEach(([k, v]) => fd.append(k, v ?? ""));
        await axios.put(url, fd, { headers: { "Content-Type": "multipart/form-data" } });
        setAllTasks((prev) =>
          prev.map((ev) => {
            if (ev.id !== editEv.id) return ev;
            const newRaw = { ...ev.raw, ...editForm, fecha: editForm.fecha || ev.raw.fecha };
            return { ...ev, fecha: newRaw.fecha, raw: newRaw };
          })
        );
        setEditOpen(false);
      } catch (e2) {
        console.error(e2);
        alert("No se pudo guardar los cambios.");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (ev) => {
    if (!ev?.serverId || !ev?.serverModel) return;
    const url = getEndpointFor(ev.serverModel, ev.serverId);
    if (!url) { alert("Este tipo de evento no se puede eliminar desde aquí."); return; }
    const ok = window.confirm("¿Eliminar este registro? No se puede deshacer.");
    if (!ok) return;
    try {
      await axios.delete(url);
      setAllTasks((prev) => prev.filter((x) => x.id !== ev.id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar el registro.");
    }
  };

  // ---------- UI ----------
  return (
    <div className="mt-3">
      {/* Filtros en una sola línea */}
      <Row className="g-2 flex-wrap mb-3">
        <Col md="auto">
          <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>Campo</Form.Label>
          <Form.Select
            value={campo}
            onChange={(e) => onCampoChange(e.target.value)}
            className="input-terrax"
            style={{ minWidth: 210 }}
          >
            <option value="">Todos</option>
            {campos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Form.Select>
        </Col>

        <Col md="auto">
          <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>Lote</Form.Label>
          <Form.Select
            value={lote}
            onChange={(e) => onLoteChange(e.target.value)}
            disabled={!campo} // deshabilita si no hay campo
            className="input-terrax"
            style={{ minWidth: 210 }}
          >
            <option value="">Todos</option>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </Form.Select>

        </Col>

        <Col md="auto">
          <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>Tipo</Form.Label>
          <Form.Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="input-terrax"
            style={{ minWidth: 210 }}
          >
            {TIPO_OPTIONS.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </Form.Select>
        </Col>

        <Col md="auto">
          <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>Desde</Form.Label>
          <Form.Control
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            style={{ minWidth: 150 }}
          />
        </Col>

        <Col md="auto">
          <Form.Label className="fw-semibold" style={{ color: "#16543a" }}>Hasta</Form.Label>
          <Form.Control
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            style={{ minWidth: 150 }}
          />
        </Col>
      </Row>

      {/* Tabla */}
      <div className="table-responsive">
        <Table bordered hover className="align-middle mb-0">
          <thead style={{ background: "#e9f6ee" }}>
            <tr>
              <th style={{ width: 140 }}>Fecha</th>
              <th style={{ width: 280 }}>Tipo de tarea</th>
              <th className="text-center" style={{ width: 210 }}>Acciones</th>

            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted py-4">
                  {loading ? "Cargando…" : "No hay eventos para los filtros seleccionados."}
                </td>
              </tr>
            )}

            {filtered.map((ev) => {
              const meta = TYPE_META[ev.tipo] || TYPE_META.OTRA;
              const isOpen = expanded.has(ev.id);
              const canEditDelete = !!(ev.serverId != null && ev.serverModel && getEndpointFor(ev.serverModel, ev.serverId));
              const pillBg = meta.dot;
              const pillFg = textColorFor(pillBg);

              return (
                <React.Fragment key={ev.id}>
                  <tr style={{ background: meta.bg }}>
                    <td className="fw-semibold">
                      {ev.fecha ? dayjs(ev.fecha).format("DD/MM/YYYY") : "-"}
                    </td>

                    <td>
                      <span
                        className="me-2 d-inline-block"
                        style={{ width: 10, height: 10, borderRadius: 999, background: meta.dot, transform: "translateY(-1px)" }}
                      />
                      <span
                        className="badge"
                        style={{ background: pillBg, color: pillFg, fontWeight: 600, fontSize: "0.95rem", padding: "0.45em 0.9em", letterSpacing: "0.3px" }}
                      >
                        {meta.label}
                      </span>
                    </td>

                    <td className="text-center" style={{ width: 1, whiteSpace: "nowrap" }}>
                      <div className="d-inline-flex gap-2">
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="rounded-circle"
                          style={{ width: 34, height: 34, borderWidth: 2 }}
                          onClick={() => toggleRow(ev.id)}
                          title={isOpen ? "Ocultar detalle" : "Ver detalle"}
                        >
                          <i className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"}`} />
                        </Button>

                        <Button
                          variant="outline-success"
                          size="sm"
                          className="rounded-circle"
                          style={{ width: 34, height: 34, borderWidth: 2 }}
                          onClick={() => openEdit(ev)}
                          title="Editar"
                          disabled={!canEditDelete}
                        >
                          <i className="bi bi-pencil" />
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-circle"
                          style={{ width: 34, height: 34, borderWidth: 2 }}
                          onClick={() => deleteTask(ev)}
                          title="Borrar"
                          disabled={!canEditDelete}
                        >
                          <i className="bi bi-trash" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={3} style={{ background: "#fafdfb" }}>
                        <div className="p-3 border rounded-3" style={{ borderColor: "#d9efe3", background: "#ffffff" }}>
                          <Row className="g-3">
                            {buildDetailPairs(ev).map(([k, v]) => (
                              <Col md={6} key={k}>
                                <Form.Label className="text-muted small mb-1">
                                  {FIELD_LABELS[k] || k}
                                </Form.Label>
                                <Form.Control size="sm" value={v} readOnly style={{ background: "#f7faf9" }} />
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

      {/* Modal editar en dos columnas */}
      <Modal show={editOpen} onHide={() => setEditOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!editEv ? null : (
            <Row className="g-3">
              {/* Fecha siempre (1/2 ancho) */}
              <Col md={6}>
                <Form.Label>{FIELD_LABELS.fecha}</Form.Label>
                <Form.Control
                  type="date"
                  value={editForm.fecha || ""}
                  onChange={(e) => setEditForm((p) => ({ ...p, fecha: e.target.value }))}
                />
              </Col>

              {/* Campos específicos por tipo -> 2 columnas; largos ocupan toda la fila */}
              {(EDITABLE_BY_TYPE[editEv.tipo] || EDITABLE_BY_TYPE.OTRA).map((k) => {
                const isLong = k === "observaciones" || k === "descripcion";
                return (
                  <Col md={isLong ? 12 : 6} key={k}>
                    <Form.Label>{FIELD_LABELS[k] || k}</Form.Label>
                    {k === "observaciones" ? (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editForm[k] ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, [k]: e.target.value }))}
                      />
                    ) : (
                      <Form.Control
                        type={NUMERIC_KEYS.has(k) ? "number" : "text"}
                        value={editForm[k] ?? ""}
                        onChange={(e) => setEditForm((p) => ({ ...p, [k]: e.target.value }))}
                      />
                    )}
                  </Col>
                );
              })}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="success" onClick={saveEdit} disabled={saving || !editEv?.serverId}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
