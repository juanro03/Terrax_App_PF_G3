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
  anotacion: "#f39c12", // Anotación de lote
};

// Labels legibles por tipo
const LABEL_MAP = {
  fertilizacion: "Fertilización",
  maleza: "Manejo de Malezas",
  laboreo: "Laboreos de Lote",
  riego: "Riego",
  fitosanitaria: "Aplicación Fitosanitaria",
  otra: "Anotación",
  anotacion: "Anotación en lote",
};

const ACTIVIDADES = Object.keys(LABEL_MAP);

const TIPO_OPTS = Object.entries(LABEL_MAP).map(([key, label]) => ({
  key,
  label,
}));

// Opciones del formulario: excluimos siembra, cosecha y anotación (las anotaciones vienen de reportes)
const FORM_TIPO_OPTS = TIPO_OPTS.filter(
  (op) => !["siembra", "cosecha", "anotacion"].includes(op.key)
);

// Meses en español para el selector
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ====== Estilos UI/UX adicionales ======
const styles = `
  .calendar-toolbar {
    border-top-left-radius: 1.4rem;
    border-top-right-radius: 1.4rem;
  }

  .fc .fc-scrollgrid {
    border-top-left-radius: 1.4rem;
    border-top-right-radius: 1.4rem;
    border-bottom-left-radius: 1.4rem;
    border-bottom-right-radius: 1.4rem;
    overflow: hidden;
  }

  .fc .fc-toolbar-title { font-weight: 700; color: #0f5132; letter-spacing: .2px; }
  .fc .fc-col-header-cell-cushion, .fc .fc-daygrid-day-number { color: #111; }

  .fc .fc-h-event, .fc .fc-daygrid-event, .fc-event {
    background: #f9f5e9ff !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 2px 6px !important;
    box-shadow: 0 1px 0 rgba(0,0,0,.04);
  }
  .fc .fc-daygrid-day-frame { padding: 4px; }

  .fc .fc-daygrid-day:hover { background: #fafcfb; }
  .fc .fc-day-today { background: #eefaf2 !important; }

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

  .calendar-toolbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: #ffffffd9;
    backdrop-filter: saturate(140%) blur(4px);
    border-bottom: 1px solid #eef3ef;
  }

  .fab-add {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 20;
    border-radius: 9999px;
    padding: 12px 16px;
    box-shadow: 0 10px 24px rgba(25,135,84,.28);
  }
    
  .fc .fc-toolbar-title::first-letter { text-transform: uppercase; }

  .filter-dropdown .dropdown-menu {
    z-index: 1060;
    min-width: 280px;
    max-height: 340px;
    overflow: auto;
    padding: 8px 10px;
  }

  .legend-dot {
    display: inline-block;
    width: 12px; height: 12px;
    border-radius: 4px; margin-right: 6px;
  }

  .loading-overlay {
    position: absolute; inset: 0; display: grid; place-items: center;
    background: rgba(255,255,255,.6); z-index: 5; border-radius: 1.4rem;
  }
  
  .fc .fc-daygrid-day-events { margin: 0 4px 2px; }
  .fc .fc-daygrid-event { max-width: 100%; box-sizing: border-box; }
  .fc .fc-daygrid-day-frame { padding: 2px 4px 4px; }

  .fc-direction-ltr .fc-daygrid-day:last-child .fc-daygrid-day-frame { padding-right: 8px; }
  .fc-direction-ltr .fc-daygrid-day:last-child .fc-daygrid-day-events { margin-right: 8px; }

  .fc-direction-ltr .fc-col-header-cell:last-child .fc-col-header-cell-cushion { padding-right: 8px; }

  .fc .fc-daygrid-day-top { padding: 2px 6px; gap: 2px; }

  .fc .fc-daygrid-day, .fc .fc-daygrid-day-frame, .fc .fc-daygrid-event { box-sizing: border-box; }

  .fc .fc-scrollgrid {
    border-bottom-left-radius: 1.4rem;
    border-bottom-right-radius: 1.4rem;
    overflow: hidden;
  }

  .fc .fc-daygrid-day.fc-day-sun .fc-daygrid-day-frame { padding-right: 16px; }
  .fc .fc-daygrid-day.fc-day-sun .fc-daygrid-day-events { margin-right: 16px; }
  .fc .fc-col-header-cell.fc-day-sun .fc-col-header-cell-cushion { padding-right: 16px; }

  .event-chip { min-width: 0; }
  .event-chip .text, .event-chip .sub {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fc .fc-scrollgrid {
    border-bottom-left-radius: 1.4rem;
    border-bottom-right-radius: 1.4rem;
    overflow: hidden;
  }

  /* Desactivar zoom de TODAS las cards dentro de no-card-zoom */
  .no-card-zoom .card,
  .no-card-zoom .card:hover,
  .no-card-zoom .card:focus,
  .no-card-zoom .card:active {
    transform: none !important;
    transition: none !important;
  }
`;

function MultiSelectActividades({ selected, onChange }) {
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
  const calendarRef = useRef(null);

  // selector mes/año
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [yearOptions, setYearOptions] = useState(() => {
    const base = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => base - 2 + i);
  });

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

  // ======= Helpers: mapear a eventos =======
  const mapTareaToEvent = (t) => {
    const tipo = t?.tipo || "otra";
    const color = COLOR_MAP[tipo] || COLOR_MAP.otra;

    const campoNombre = t.campo_nombre || "";
    const loteNombre =
      t.lote_nombre || (t?.lote ? `Lote ${t.lote}` : "Lote");

    const titleBase = LABEL_MAP[tipo] || "Tarea";
    const title = campoNombre
      ? `${titleBase} · ${campoNombre} / ${loteNombre}`
      : `${titleBase} · ${loteNombre}`;

    return {
      id: String(
        t.id ?? `${tipo}-${t.fecha}-${t.lote ?? ""}-${Math.random()}`
      ),
      title,
      start: t.fecha,
      allDay: true,
      extendedProps: {
        tipo,
        color,
        observaciones: t.observaciones || "",
        lote: t.lote,
        lote_nombre: loteNombre,
        campo_nombre: campoNombre,
        raw: t,
      },
    };
  };

  const mapSiembraToEvent = (s) => {
    const loteNombre =
      s?.lote_nombre || (s?.lote ? `Lote ${s.lote}` : "Lote");
    const campoNombre = s?.campo_nombre || "";
    const titleBase = LABEL_MAP.siembra || "Siembra";
    const title = campoNombre
      ? `${titleBase} · ${campoNombre} / ${loteNombre}`
      : `${titleBase} · ${loteNombre}`;

    return {
      id: `siembra-${s.id}`,
      title,
      start: s.fecha,
      allDay: true,
      extendedProps: {
        tipo: "siembra",
        color: COLOR_MAP.siembra,
        lote: s.lote,
        lote_nombre: loteNombre,
        campo_nombre: campoNombre,
        observaciones: "",
        raw: s,
      },
    };
  };

  const mapCosechaToEvent = (c) => {
    const loteNombre =
      c?.lote_nombre || (c?.lote ? `Lote ${c.lote}` : "Lote");
    const campoNombre = c?.campo_nombre || "";
    const titleBase = LABEL_MAP.cosecha || "Cosecha";
    const title = campoNombre
      ? `${titleBase} · ${campoNombre} / ${loteNombre}`
      : `${titleBase} · ${loteNombre}`;

    return {
      id: `cosecha-${c.id}`,
      title,
      start: c.fecha,
      allDay: true,
      extendedProps: {
        tipo: "cosecha",
        color: COLOR_MAP.cosecha,
        lote: c.lote,
        lote_nombre: loteNombre,
        campo_nombre: campoNombre,
        observaciones: c.rinde ? `Rinde: ${c.rinde}` : "",
        raw: c,
      },
    };
  };

  const mapAnotacionToEvent = (a) => {
    const loteNombre =
      a?.lote_nombre || (a?.lote ? `Lote ${a.lote}` : "Lote");
    const campoNombre = a?.campo_nombre || "";
    const titleBase = LABEL_MAP.anotacion || "Anotación";
    const title = campoNombre
      ? `${titleBase} · ${campoNombre} / ${loteNombre}`
      : `${titleBase} · ${loteNombre}`;

    const fecha = a.creado_en?.slice(0, 10); // fecha de creación

    return {
      id: `anotacion-${a.id}`,
      title,
      start: fecha,
      allDay: true,
      extendedProps: {
        tipo: "anotacion",
        color: COLOR_MAP.anotacion,
        observaciones: a.texto || "",
        lote: a.lote,
        lote_nombre: loteNombre,
        campo_nombre: campoNombre,
        raw: a,
      },
    };
  };

  // helper de rango para distintos campos de fecha
  const enRango = (it, field, startStr, endStr) => {
    if (!startStr || !endStr) return true;
    const raw = it[field];
    if (!raw) return false;
    const fecha = raw.slice(0, 10);
    return fecha >= startStr && fecha < endStr;
  };

  // ======= Fetch de eventos (tareas + siembras + cosechas + anotaciones) =======
  const fetchEventos = async ({ startStr, endStr }) => {
    setLoading(true);
    setErrorTxt("");
    try {
      const params = {};
      if (startStr) params.start = startStr;
      if (endStr) params.end = endStr;
      if (campo) params.campo = campo;
      if (lote) params.lote = lote;

      // 1) Tareas, Siembras, Cosechas (filtradas por backend + usuario)
      const [tRes, sRes, cRes] = await Promise.all([
        axios.get("/api/tareas/", { params }),
        axios.get("/api/siembras/", { params }),
        axios.get("/api/cosechas/", { params }),
      ]);

      const tareas = Array.isArray(tRes.data) ? tRes.data : [];
      const siembras = Array.isArray(sRes.data) ? sRes.data : [];
      const cosechas = Array.isArray(cRes.data) ? cRes.data : [];

      // 2) Anotaciones de lotes
      let anotaciones = [];
      try {
        let loteIds = [];

        if (lote) {
          // filtro por un lote puntual
          loteIds = [lote];
        } else if (campo) {
          // filtro por todos los lotes de un campo
          const { data: lotesCampo } = await axios.get(
            `/api/lotes/por-campo/${campo}/`
          );
          loteIds = (Array.isArray(lotesCampo) ? lotesCampo : []).map(
            (l) => l.id
          );
        } else {
          // Campo = Todos, Lote = Todos -> TODOS los lotes del usuario
          const { data: lotesUsuario } = await axios.get("/api/lotes/");
          loteIds = (Array.isArray(lotesUsuario) ? lotesUsuario : []).map(
            (l) => l.id
          );
        }

        if (loteIds.length) {
          const anotPromises = loteIds.map((id) =>
            axios
              .get(`/api/lotes/${id}/anotaciones/`)
              .then((r) => r.data)
              .catch(() => [])
          );
          const anotArrays = await Promise.all(anotPromises);
          anotaciones = anotArrays.flat();
        }
      } catch (err) {
        console.error("Error cargando anotaciones:", err);
      }

      const eventosTareas = tareas
        .filter((t) => enRango(t, "fecha", startStr, endStr))
        .filter((t) => filtroActividades.has(t.tipo || "otra"))
        .map(mapTareaToEvent);

      const eventosSiembras = siembras
        .filter((s) => enRango(s, "fecha", startStr, endStr))
        .map(mapSiembraToEvent);

      const eventosCosechas = cosechas
        .filter((c) => enRango(c, "fecha", startStr, endStr))
        .map(mapCosechaToEvent);

      const eventosAnotaciones = anotaciones
        .filter((a) => enRango(a, "creado_en", startStr, endStr))
        .map(mapAnotacionToEvent);

      setEventos([
        ...eventosTareas,
        ...eventosSiembras,
        ...eventosCosechas,
        ...eventosAnotaciones,
      ]);
    } catch (err) {
      const msg = err?.response?.data
        ? typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data)
        : err?.message || "Error desconocido";
      setErrorTxt(`No se pudieron cargar las actividades: ${msg}`);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Cada vez que cambia CAMPO o LOTE, recargo eventos con ese filtro
  useEffect(() => {
    if (rangoRef.current.startStr) {
      fetchEventos(rangoRef.current);
    }
  }, [campo, lote]);

  // ======= Eventos filtrados por tipo (checkbox de actividades) =======
  const eventosFiltrados = useMemo(
    () =>
      eventos.filter((ev) =>
        filtroActividades.has(ev.extendedProps?.tipo || "otra")
      ),
    [eventos, filtroActividades]
  );

  // ======= Rango de fechas del calendario =======
  const onDatesSet = (arg) => {
    const startStr = arg?.startStr?.slice(0, 10);
    const endStr = arg?.endStr?.slice(0, 10);
    rangoRef.current = { startStr, endStr };

    // calcular "mes visible" tomando una fecha intermedia del rango
    if (arg.start) {
      const midTime =
        arg.start.getTime() + 20 * 24 * 60 * 60 * 1000; // +20 días aprox
      const midDate = new Date(midTime);
      const y = midDate.getFullYear();
      const m = midDate.getMonth();
      setSelectedYear(y);
      setSelectedMonth(m);
      // actualizar opciones de año centradas en el año actual de vista
      setYearOptions(
        Array.from({ length: 5 }, (_, i) => y - 2 + i)
      );
    }

    fetchEventos({ startStr, endStr });
  };

  const handleRefresh = () => fetchEventos(rangoRef.current || {});

  // ======= Handlers mes / año =======
  const gotoSelectedDate = (year, month) => {
    const api = calendarRef.current?.getApi();
    if (!api || !year && year !== 0 || !month && month !== 0) return;
    const date = new Date(year, month, 1);
    api.gotoDate(date);
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setSelectedMonth(newMonth);
    gotoSelectedDate(selectedYear, newMonth);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setSelectedYear(newYear);
    gotoSelectedDate(newYear, selectedMonth);
  };

  // ======= Helpers UI =======
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

  const headerStyle = (tipo) => ({
    background: `${COLOR_MAP[tipo] || "#198754"}10`,
    borderBottom: `2px solid ${COLOR_MAP[tipo] || "#198754"}`,
  });

  // ======= Form helpers =======
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

  return (

    <Card
      className="mx-auto my-4 shadow position-relative no-zoom-card"
      style={{
        maxWidth: 1160,
        background: "#fff",
        borderRadius: "1.4rem",
        border: "none",
        overflow: "visible",
        transform: "none",
        transition: "none",
      }}
    ><style>{styles}</style>
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
          <Col md={4} className="d-flex flex-column align-items-md-end gap-2">
            <div className="d-flex gap-2 w-100 justify-content-md-end">
              <MultiSelectActividades
                selected={filtroActividades}
                onChange={setFiltroActividades}
              />
              <Button variant="btn btn-outline-success" onClick={() => openForm({})}>
                + Nuevo
              </Button>
            </div>
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

      <Card.Body className="p-0 calendario-card-body">
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



          {/* Calendario */}
          <div className="px-3">
            <div
              style={{
                borderBottomLeftRadius: "1.4rem",
                borderBottomRightRadius: "1.4rem",
              }}
            >
              <FullCalendar
                ref={calendarRef}
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
                buttonText={{
                  today: "Hoy", // ← traducido
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
                    campo_nombre: info.event.extendedProps?.campo_nombre,
                    raw: info.event.extendedProps?.raw,
                  });
                }}
                eventContent={renderEventContent}
                dayMaxEventRows={4}
                moreLinkContent={(arg) => `${arg.num} más`}
              />
            </div>
          </div>

          {/* Empty state */}
          {!loading && eventosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-2">
                <Badge bg="light" text="dark" className="border">
                  Sin resultados
                </Badge>
              </div>
              <p className="text-muted mb-2">
                No hay actividades en este mes para el rango y filtros
                seleccionados.
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
                  + Crear anotación
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card.Body>

      {/* Modal detalle */}
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
            <strong>Campo: </strong>
            {detalle?.campo_nombre || detalle?.raw?.campo_nombre || "-"}
          </p>
          <p className="mb-1">
            <strong>Lote: </strong>
            {detalle?.lote_nombre || "-"}
          </p>
          <p className="mb-0">
            <strong>Observaciones: </strong>
            {detalle?.observaciones || "—"}
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end gap-2">
          {/*<Button
            variant="outline-success"
            onClick={() => {
              openForm({
                dateStr: detalle?.fecha,
                presetCampo: campo,
                presetLote: detalle?.raw?.lote || lote || "",
                presetTipo:
                  detalle?.tipo &&
                    ["siembra", "cosecha"].includes(detalle.tipo)
                    ? "otra"
                    : detalle?.tipo || "otra",
              });
              setDetalle(null);
            }}
          >
            + Agregar comentario este día
          </Button>*/}
          <Button variant="success" onClick={() => setDetalle(null)}>
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
                  {FORM_TIPO_OPTS.map((op) => (
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
