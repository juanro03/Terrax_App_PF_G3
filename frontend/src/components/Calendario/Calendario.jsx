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
  Badge,
  Spinner,
  Modal,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "../../axiosconfig";

// Colores por tipo (coinciden con tu backend)
const COLOR_MAP = {
  fertilizacion: "#78e495ff",
  maleza: "#198754",
  laboreo: "#619472ff",
  riego: "#20c997",
  fitosanitaria: "#54ad6fff",
  otra: "#637c6fff",
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

const TIPO_OPTS = Object.entries(LABEL_MAP).map(([key, label]) => ({
  key,
  label,
}));
const ACTIVIDADES = Object.keys(LABEL_MAP);

// 🔧 CSS para forzar texto azul -> negro + estilos del botón “+” en celdas
const calendarTextCss = `
  .fc .fc-daygrid-day-number { color: #000 !important; }
  .fc .fc-col-header-cell-cushion { color: #000 !important; }
  .fc .fc-daygrid-more-link { color: #000 !important; }
  .fc .fc-toolbar-title { color: #000 !important; }

  /* Alinear contenido del header del día y dejar hueco entre + y número */
  .fc .fc-daygrid-day-top {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 6px; /* separa el + del número */
  }

  /* Botón + inline, no posicionado absoluto */
  .fc .fc-add-inline-btn {
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #198754;
    color: #fff;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity .15s ease-in-out, transform .05s ease;
  }
  .fc .fc-daygrid-day:hover .fc-add-inline-btn { opacity: 1; }
  .fc .fc-add-inline-btn:active { transform: scale(0.96); }
`;

export default function Calendario() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorTxt, setErrorTxt] = useState("");
  const [okTxt, setOkTxt] = useState("");

  // Filtros superiores
  const [filtroActividades, setFiltroActividades] = useState(
    () => new Set(ACTIVIDADES)
  );
  const [campo, setCampo] = useState("");
  const [lote, setLote] = useState("");
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);

  // Rango visible en calendario para pedir datos al backend
  const rangoRef = useRef({ startStr: null, endStr: null });

  // Modal de detalle
  const [detalle, setDetalle] = useState(null);

  // Modal de alta rápida (tarea/comentario)
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

  // Cargar combos de campos/lotes
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

  // ===== Helpers formulario rápido =====
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
    // cargar lotes del campo elegido en el form
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

    // Validaciones mínimas
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
      setOkTxt("¡Anotación agregado correctamente!");
      // refrescar calendario
      if (rangoRef.current.startStr) {
        await fetchEventos(rangoRef.current);
      }
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
    const titulo = `${LABEL_MAP[tipo] || "Tarea"} · ${loteLabel}`;

    return {
      id: String(t.id ?? `${tipo}-${t.fecha}-${t.lote ?? ""}-${Math.random()}`),
      title: titulo,
      start: t.fecha, // YYYY-MM-DD (allDay)
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      textColor: "#fff",
      extendedProps: {
        tipo,
        observaciones: t.observaciones || "",
        lote: t.lote,
        lote_nombre: t.lote_nombre,
        raw: t,
      },
    };
  };

  // Fetch de tareas desde el backend
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

      const enRango = (it) => {
        if (!startStr || !endStr) return true;
        return it.fecha >= startStr && it.fecha < endStr; // end exclusivo
      };

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

  // Refiltrar en memoria cuando cambian filtros sin mover el calendario
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) =>
      filtroActividades.has(ev.extendedProps?.tipo || "otra")
    );
  }, [eventos, filtroActividades]);

  // Manejo de cambio de mes / rango visible (FullCalendar)
  const onDatesSet = (arg) => {
    const startStr = arg?.startStr?.slice(0, 10); // YYYY-MM-DD
    const endStr = arg?.endStr?.slice(0, 10);
    rangoRef.current = { startStr, endStr };
    fetchEventos({ startStr, endStr });
  };

  // Botón "Actualizar" manual
  const handleRefresh = () => {
    fetchEventos(rangoRef.current || {});
  };

  // Cambio de filtros de actividad
  const toggleActividad = (key) => {
    setFiltroActividades((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Re-fetch cuando cambian campo/lote
  useEffect(() => {
    if (rangoRef.current.startStr) {
      fetchEventos(rangoRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campo, lote]);

  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{
        maxWidth: 1160,
        background: "#fff",
        borderRadius: "1.4rem",
        border: "none",
        overflow: "hidden",
      }}
    >
      <Card.Body>
        {/* CSS: texto negro + botón en celdas */}
        <style>{calendarTextCss}</style>

        <Card.Title className="fw-bold mb-3" style={{ color: "#155a36" }}>
          Calendario Personal
        </Card.Title>

        {/* Mensajes */}
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

        {/* Filtros */}
        <Row className="g-3 align-items-end mb-3">
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
          <Col md={4} className="d-flex gap-2">
            {/* Si querés ocultar este botón, simplemente borrá estas 2 líneas */}
            <Button
              variant="success"
              className="ms-auto"
              onClick={() => openForm({})}
            >
              + Nueva tarea o anotación
            </Button>
            <Button variant="outline-success" onClick={handleRefresh}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />{" "}
                  Cargando…
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
          </Col>
        </Row>

        {/* Chips de filtro por actividad */}
        <div className="mb-3 d-flex flex-wrap gap-2">
          {ACTIVIDADES.map((k) => (
            <Badge
              key={k}
              pill
              bg={filtroActividades.has(k) ? "success" : "secondary"}
              style={{
                cursor: "pointer",
                background: COLOR_MAP[k] || undefined,
              }}
              onClick={() => toggleActividad(k)}
              title={LABEL_MAP[k]}
            >
              {LABEL_MAP[k]}
            </Badge>
          ))}
        </div>

        {/* Calendario */}
        <div className="calendar-wrapper">
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
            /* Click en el día completo también abre el form */
            dateClick={(info) => openForm({ dateStr: info.dateStr })}
            /* aca agregamos el botón “+” dentro de cada celda */
            dayCellDidMount={(args) => {
              try {
                const topEl = args.el.querySelector(".fc-daygrid-day-top");
                if (!topEl) return;

                const numberEl = topEl.querySelector(".fc-daygrid-day-number");

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "fc-add-inline-btn";
                btn.title = "Nueva anotación personal";
                btn.setAttribute("aria-label", "Nueva anotación personal");
                btn.textContent = "+";

                btn.addEventListener("click", (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const dateStr = args.date.toISOString().slice(0, 10);
                  openForm({ dateStr }); // tu modal con la fecha precargada
                });

                // 👉 Insertar a la izquierda del número (antes en el DOM)
                if (numberEl) topEl.insertBefore(btn, numberEl);
                else topEl.appendChild(btn);
              } catch {
                /* no-op */
              }
            }}
            eventClick={(info) => {
              setDetalle({
                id: info.event.id,
                title: info.event.title,
                fecha: info.event.startStr?.slice(0, 10),
                tipo: info.event.extendedProps?.tipo,
                observaciones: info.event.extendedProps?.observaciones || "",
                lote: info.event.extendedProps?.lote,
                lote_nombre: info.event.extendedProps?.lote_nombre,
                raw: info.event.extendedProps?.raw,
              });
            }}
          />
        </div>

        {/* Leyenda */}
        <div className="mt-3 d-flex flex-wrap gap-3">
          {ACTIVIDADES.map((k) => (
            <div key={k} className="d-flex align-items-center gap-2">
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: COLOR_MAP[k],
                }}
              />
              <small>{LABEL_MAP[k]}</small>
            </div>
          ))}
        </div>
      </Card.Body>

      {/* Modal detalle */}
      <Modal show={!!detalle} onHide={() => setDetalle(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {LABEL_MAP[detalle?.tipo || "otra"] || "Evento"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            <strong>Fecha: </strong>
            {detalle?.fecha}
          </p>
          <p className="mb-1">
            <strong>Lote: </strong>
            {detalle?.lote_nombre
              ? detalle.lote_nombre
              : detalle?.lote
              ? `#${detalle.lote}`
              : "-"}
          </p>
          <p className="mb-1">
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
                presetTipo: "otra",
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

      {/* Modal alta rápida tarea/comentario */}
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
                  placeholder="Notas, comentario o detalles de la tarea…"
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
