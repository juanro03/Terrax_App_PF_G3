// src/components/Calendario/Calendario.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Card,
  Row,
  Col,
  Form,
  Spinner,
  Modal,
  Button,
  Alert,
  Dropdown,
  ButtonGroup,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import axios from "../../axiosconfig";

// ====== Diseño: Colores por tipo (coinciden con backend) ======
const COLOR_MAP = {
  fertilizacion: "#e478d0ff",
  maleza: "#0f0f0fff",
  laboreo: "#a35f23ff",
  riego: "#79beecff",
  fitosanitaria: "#54ad6f",
  otra: "#a2a5a3ff",
};
// Labels legibles por tipo
const LABEL_MAP = {
  fertilizacion: "Fertilización",
  maleza: "Manejo de Malezas",
  laboreo: "Laboreos de Lote",
  riego: "Riego",
  fitosanitaria: "Aplicación Fitosanitaria",
  otra: "Anotación",
};
const ACTIVIDADES = Object.keys(LABEL_MAP);
const TIPO_OPTS = Object.entries(LABEL_MAP).map(([key, label]) => ({
  key,
  label,
}));

// ====== Estilos UI/UX adicionales ======
const styles = `
  /* Tipografía más clara del calendario y encabezados */
  .fc .fc-toolbar-title { font-weight: 700; color: #0f5132; letter-spacing: .2px; }
  .fc .fc-col-header-cell-cushion, .fc .fc-daygrid-day-number { color: #111; }

  /* Eventos con pastilla redondeada y fondo cremita (sobrescribe celeste default) */
  .fc .fc-h-event, .fc .fc-daygrid-event, .fc-event {
    background: #f9f5e9ff !important; /* cremita */
    border: none !important;
    border-radius: 12px !important;
    padding: 2px 6px !important;
    box-shadow: 0 1px 0 rgba(0,0,0,.04);
  }
  .fc .fc-daygrid-day-frame { padding: 4px; }

  /* Hover sutil en días y eventos */
  .fc .fc-daygrid-day:hover { background: #fafcfb; }

  /* Hoy destacado pero no invasivo */
  .fc .fc-day-today { background: #eefaf2 !important; }

  /* Chip del evento con barra lateral de color por tipo */
  .event-chip {
    display: grid;
    grid-template-columns: 6px 1fr;
    gap: 8px;
    align-items: center;
  }
  .event-chip .bar {
    height: 100%;
    border-radius: 8px;
    background: var(--evcolor, #198754);
  }
  .event-chip .text {
    color: #0f172a;
    font-weight: 600;
    line-height: 1.2;
    font-size: 12.5px;
  }
  .event-chip .sub {
    color: #334155;
    font-weight: 500;
    font-size: 11.5px;
  }

  /* Toolbar sticky: siempre visible al hacer scroll */
  .calendar-toolbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: #ffffffd9;
    backdrop-filter: saturate(140%) blur(4px);
    border-bottom: 1px solid #eef3ef;
  }

  /* Botón de acción flotante (FAB) */
  .fab-add {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 20;
    border-radius: 9999px;
    padding: 12px 16px;
    box-shadow: 0 10px 24px rgba(25,135,84,.28);
  }

  /* Multiselect dropdown ancho y scrolleable, encima del calendario */
  .filter-dropdown .dropdown-menu {
    z-index: 1060;
    min-width: 280px;
    max-height: 340px;
    overflow: auto;
    padding: 8px 10px;
  }

  /* Leyenda compacta */
  .legend-dot {
    display: inline-block;
    width: 12px; height: 12px;
    border-radius: 4px; margin-right: 6px;
  }

  /* Overlay loading */
  .loading-overlay {
    position: absolute; inset: 0; display: grid; place-items: center;
    background: rgba(255,255,255,.6); z-index: 5; border-radius: 1.4rem;
  }
`;

function MultiSelectActividades({ selected, onChange }) {
  const allSelected = selected.size === ACTIVIDADES.length;

  const toggleOne = (k) => {
    const next = new Set(selected);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    onChange(next);
  };
  const selectAll = () => onChange(new Set(ACTIVIDADES));
  const clearAll = () => onChange(new Set());

  return (
    <Dropdown as={ButtonGroup} className="filter-dropdown">
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>Filtrar por tipo</Tooltip>}
      >
        <Dropdown.Toggle variant="outline-success">
          Tipos ({selected.size})
        </Dropdown.Toggle>
      </OverlayTrigger>
      <Dropdown.Menu>
        <div className="d-flex gap-2 mb-2">
          <Button size="sm" variant="outline-secondary" onClick={selectAll}>
            Todos
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={clearAll}>
            Ninguno
          </Button>
        </div>
        {ACTIVIDADES.map((k) => (
          <Form.Check
            key={k}
            type="checkbox"
            id={`chk-${k}`}
            className="mb-1"
            label={
              <span>
                <span
                  className="legend-dot"
                  style={{ background: COLOR_MAP[k] }}
                />
                {LABEL_MAP[k]}
              </span>
            }
            checked={selected.has(k)}
            onChange={() => toggleOne(k)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default function Calendario() {
  // ======= Estado =======
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorTxt, setErrorTxt] = useState("");
  const [okTxt, setOkTxt] = useState("");

  const [filtroActividades, setFiltroActividades] = useState(
    () => new Set(ACTIVIDADES)
  );
  const [campo, setCampo] = useState("");
  const [lote, setLote] = useState("");
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);

  const [detalle, setDetalle] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    fecha: "",
    campoId: "",
    loteId: "",
    tipo: "otra",
    observaciones: "",
  });
  const [formLotes, setFormLotes] = useState([]);

  const rangoRef = useRef({ startStr: null, endStr: null });

  // ======= Carga de combos =======
  useEffect(() => {
    axios
      .get("/api/campos/")
      .then((r) => setCampos(r.data))
      .catch(() => setCampos([]));
  }, []);
  useEffect(() => {
    if (!campo) {
      setLotes([]);
      setLote("");
      return;
    }
    axios
      .get(`/api/lotes/por-campo/${campo}/`)
      .then((r) => setLotes(r.data))
      .catch(() => setLotes([]));
  }, [campo]);

  // ======= Helpers =======
  const openForm = ({
    dateStr = "",
    presetCampo = campo,
    presetLote = lote,
    presetTipo = "otra",
  } = {}) => {
    setForm({
      fecha: dateStr || "",
      campoId: presetCampo || "",
      loteId: presetLote || "",
      tipo: presetTipo,
      observaciones: "",
    });
    if (presetCampo) {
      axios
        .get(`/api/lotes/por-campo/${presetCampo}/`)
        .then((r) => setFormLotes(r.data))
        .catch(() => setFormLotes([]));
    } else {
      setFormLotes([]);
    }
    setShowForm(true);
  };

  const handleFormCampoChange = async (campoId) => {
    setForm((f) => ({ ...f, campoId, loteId: "" }));
    if (!campoId) {
      setFormLotes([]);
      return;
    }
    try {
      const { data } = await axios.get(`/api/lotes/por-campo/${campoId}/`);
      setFormLotes(data);
    } catch {
      setFormLotes([]);
    }
  };

  const submitNuevaTarea = async (e) => {
    e.preventDefault();
    setErrorTxt("");
    setOkTxt("");
    if (!form.fecha || !form.tipo || !form.loteId) {
      setErrorTxt("Completá fecha, tipo y lote para guardar.");
      return;
    }
    const payload = new FormData();
    payload.append("lote", form.loteId);
    payload.append("tipo", form.tipo);
    payload.append("fecha", form.fecha);
    payload.append("observaciones", form.observaciones || "");
    try {
      setSending(true);
      await axios.post("/api/tareas/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowForm(false);
      setOkTxt("¡Anotación agregada correctamente!");
      if (rangoRef.current.startStr) await fetchEventos(rangoRef.current);
      setTimeout(() => setOkTxt(""), 4000);
    } catch (err) {
      const msg = err?.response?.data
        ? typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data)
        : err?.message || "Error desconocido";
      setErrorTxt(`No se pudo guardar: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  // Adaptador de tareas -> eventos FullCalendar
  const mapTareaToEvent = (t) => {
    const tipo = t?.tipo || "otra";
    const color = COLOR_MAP[tipo] || COLOR_MAP.otra;
    const loteLabel = t?.lote_nombre || (t?.lote ? `Lote ${t.lote}` : "Lote");
    return {
      id: String(t.id ?? `${tipo}-${t.fecha}-${t.lote ?? ""}-${Math.random()}`),
      title: `${LABEL_MAP[tipo] || "Tarea"} · ${loteLabel}`,
      start: t.fecha,
      allDay: true,
      extendedProps: {
        tipo,
        color,
        observaciones: t.observaciones || "",
        lote: t.lote,
        lote_nombre: t.lote_nombre,
        raw: t,
      },
    };
  };

  const fetchEventos = async ({ startStr, endStr }) => {
    setLoading(true);
    setErrorTxt("");
    try {
      const params = {};
      if (startStr) params.start = startStr;
      if (endStr) params.end = endStr;
      if (campo) params.campo = campo;
      if (lote) params.lote = lote;

      const { data } = await axios.get("/api/tareas/", { params });
      const enRango = (it) =>
        !startStr || !endStr ? true : it.fecha >= startStr && it.fecha < endStr;
      const filtradas = (Array.isArray(data) ? data : [])
        .filter(enRango)
        .filter((t) => filtroActividades.has(t.tipo || "otra"))
        .map(mapTareaToEvent);

      setEventos(filtradas);
    } catch (err) {
      const msg = err?.response?.data
        ? typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data)
        : err?.message || "Error desconocido";
      setErrorTxt(`No se pudieron cargar las tareas: ${msg}`);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const eventosFiltrados = useMemo(
    () =>
      eventos.filter((ev) =>
        filtroActividades.has(ev.extendedProps?.tipo || "otra")
      ),
    [eventos, filtroActividades]
  );

  const onDatesSet = (arg) => {
    const startStr = arg?.startStr?.slice(0, 10);
    const endStr = arg?.endStr?.slice(0, 10);
    rangoRef.current = { startStr, endStr };
    fetchEventos({ startStr, endStr });
  };

  const handleRefresh = () => fetchEventos(rangoRef.current || {});

  // Render rico de evento
  const renderEventContent = (info) => {
    const tipo = info.event.extendedProps?.tipo || "otra";
    const color = info.event.extendedProps?.color || COLOR_MAP[tipo];
    const [titulo, sub] = info.event.title.split(" · ");
    return (
      <div className="event-chip" style={{ "--evcolor": color }}>
        <div className="bar" />
        <div className="d-flex flex-column py-1">
          <div className="text">{titulo}</div>
          {sub && <div className="sub">{sub}</div>}
        </div>
      </div>
    );
  };

  // Modal detalle: header temático por tipo
  const headerStyle = (tipo) => ({
    background: `${COLOR_MAP[tipo] || "#198754"}10`,
    borderBottom: `2px solid ${COLOR_MAP[tipo] || "#198754"}`,
  });

  return (
    <Card
      className="mx-auto my-4 shadow position-relative"
      style={{
        maxWidth: 1160,
        background: "#fff",
        borderRadius: "1.4rem",
        border: "none",
        overflow: "visible", // permite que el dropdown no se recorte
      }}
    >
      <style>{styles}</style>

      {/* Toolbar Sticky: filtros y acciones */}
      <div className="calendar-toolbar px-4 pt-3 pb-2">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Label className="fw-semibold">Campo</Form.Label>
            <Form.Select
              value={campo}
              onChange={(e) => {
                setCampo(e.target.value);
                setLote("");
              }}
            >
              <option value="">Todos</option>
              {campos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold">Lote</Form.Label>
            <Form.Select
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              disabled={!campo}
            >
              <option value="">Todos</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4} className="d-flex gap-2 justify-content-md-end">
            <MultiSelectActividades
              selected={filtroActividades}
              onChange={setFiltroActividades}
            />
            <Button variant="outline-success" onClick={handleRefresh}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Cargando…
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
            <Button variant="success" onClick={() => openForm({})}>
              + Nuevo
            </Button>
          </Col>
        </Row>

        {/* Hints compactos */}
        <div className="pt-2 pb-1 d-flex flex-wrap gap-3">
          {ACTIVIDADES.map((k) => (
            <span key={k}>
              <span
                className="legend-dot"
                style={{ background: COLOR_MAP[k] }}
              />{" "}
              <small className="text-muted">{LABEL_MAP[k]}</small>
            </span>
          ))}
        </div>
      </div>

      <Card.Body className="p-0">
        {/* Mensajes */}
        <div className="px-4 pt-3">
          {okTxt && (
            <Alert variant="success" className="py-2">
              {okTxt}
            </Alert>
          )}
          {errorTxt && (
            <Alert
              variant="danger"
              className="py-2"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {errorTxt}
            </Alert>
          )}
        </div>

        <div className="position-relative px-2 pb-3">
          {loading && (
            <div className="loading-overlay">
              <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span className="fw-semibold text-success">
                  Cargando calendario…
                </span>
              </div>
            </div>
          )}

          {/* Calendario envuelto para conservar esquinas redondeadas abajo */}
          <div className="px-3">
            <div
              style={{
                overflow: "hidden",
                borderBottomLeftRadius: "1.4rem",
                borderBottomRightRadius: "1.4rem",
              }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="auto"
                firstDay={1}
                locale="es"
                fixedWeekCount={false}
                showNonCurrentDates={false}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "",
                }}
                events={eventosFiltrados}
                datesSet={onDatesSet}
                dateClick={(info) => openForm({ dateStr: info.dateStr })}
                eventClick={(info) => {
                  setDetalle({
                    id: info.event.id,
                    title: info.event.title,
                    fecha: info.event.startStr?.slice(0, 10),
                    tipo: info.event.extendedProps?.tipo,
                    observaciones:
                      info.event.extendedProps?.observaciones || "",
                    lote: info.event.extendedProps?.lote,
                    lote_nombre: info.event.extendedProps?.lote_nombre,
                    raw: info.event.extendedProps?.raw,
                  });
                }}
                eventContent={renderEventContent}
                dayMaxEventRows={4}
                moreLinkContent={(arg) => `${arg.num} más`}
              />
            </div>
          </div>

          {/* Empty state visual cuando no hay eventos filtrados */}
          {!loading && eventosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-2">
                <Badge bg="light" text="dark" className="border">
                  Sin resultados
                </Badge>
              </div>
              <p className="text-muted mb-2">
                No hay actividades para el rango y filtros seleccionados.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => setFiltroActividades(new Set(ACTIVIDADES))}
                >
                  Limpiar filtros
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => openForm({})}
                >
                  + Crear actividad
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card.Body>

      {/* Modal detalle (header temático) */}
      <Modal show={!!detalle} onHide={() => setDetalle(null)} centered>
        <Modal.Header closeButton style={headerStyle(detalle?.tipo || "otra")}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <span
              className="legend-dot"
              style={{ background: COLOR_MAP[detalle?.tipo || "otra"] }}
            />
            {LABEL_MAP[detalle?.tipo || "otra"] || "Evento"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            <strong>Fecha: </strong>
            {detalle?.fecha || "-"}
          </p>
          <p className="mb-1">
            <strong>Lote: </strong>
            {detalle?.lote_nombre
              ? detalle.lote_nombre
              : detalle?.lote
              ? `#${detalle.lote}`
              : "-"}
          </p>
          <p className="mb-0">
            <strong>Observaciones: </strong>
            {detalle?.observaciones || "—"}
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="outline-success"
            onClick={() => {
              openForm({
                dateStr: detalle?.fecha,
                presetCampo: campo,
                presetLote: detalle?.lote || lote || "",
                presetTipo: detalle?.tipo || "otra",
              });
              setDetalle(null);
            }}
          >
            + Agregar comentario este día
          </Button>
          <Button variant="secondary" onClick={() => setDetalle(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal alta rápida */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={submitNuevaTarea}>
          <Modal.Header closeButton>
            <Modal.Title>Nueva Anotación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={form.fecha || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fecha: e.target.value }))
                  }
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tipo: e.target.value }))
                  }
                  required
                >
                  {TIPO_OPTS.map((op) => (
                    <option key={op.key} value={op.key}>
                      {op.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Campo</Form.Label>
                <Form.Select
                  value={form.campoId}
                  onChange={(e) => handleFormCampoChange(e.target.value)}
                  required
                >
                  <option value="">Seleccione…</option>
                  {campos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Lote</Form.Label>
                <Form.Select
                  value={form.loteId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, loteId: e.target.value }))
                  }
                  disabled={!form.campoId}
                  required
                >
                  <option value="">Seleccione…</option>
                  {(form.campoId === campo ? lotes : formLotes).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Notas, comentario o detalles…"
                  value={form.observaciones}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observaciones: e.target.value }))
                  }
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="success" disabled={sending}>
              {sending ? "Guardando…" : "Guardar"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Card>
  );
}
