import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import axios from "../../axiosconfig";
import { FaArrowRight, FaArrowDown, FaArrowLeft } from "react-icons/fa";
import "./Trazabilidad.css";

dayjs.locale("es");



const parseDate = (v) => {
  if (!v) return null;
  const tryStrict = dayjs(v, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
  if (tryStrict.isValid()) return tryStrict;
  const loose = dayjs(v);
  return loose.isValid() ? loose : null;
};

// Colores / rótulos por tipo
const TYPE_META = {
  SIEMBRA:         { label: "Siembra",                   color: "#bde5c8" },
  COSECHA:         { label: "Cosecha",                   color: "#ffeaa7" },
  FERTILIZACION:   { label: "Fertilización",             color: "#e6d7f7" },
  MALEZAS:         { label: "Manejo de Malezas",         color: "#f7c7c7" },
  LABOREO:         { label: "Laboreos de Lote",          color: "#dcc4b6" },
  RIEGO:           { label: "Riego",                     color: "#cde9f6" },
  FITOSANITARIA:   { label: "Aplicación Fitosanitaria",  color: "#dbe6dc" },
};

// normaliza string a comparación simple
const norm = (s) =>
  (s || "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// mapear el tipo de la tarea del backend a nuestros TYPE_META
const taskTypeToMeta = (tipo) => {
  const t = norm(tipo);
  if (t.includes("fertili")) return "FERTILIZACION";
  if (t.includes("maleza"))  return "MALEZAS";
  if (t.includes("laboreo")) return "LABOREO";
  if (t.includes("riego"))   return "RIEGO";
  if (t.includes("fitosan")) return "FITOSANITARIA";
  return "LABOREO"; // fallback genérico
};

// --- arriba, junto a normalize y TYPE_META ---
const toArr = (data) => Array.isArray(data) ? data : (data ? [data] : []);

// normalizador común
const normalize = (items, type, map) =>
  (items || []).map((it) => ({
    id: it.id,
    type,
    date: map.date(it),
    title: TYPE_META[type].label,
    meta: map.meta ? map.meta(it) : null,
    raw: it,
  }));

export default function Trazabilidad() {
  const { loteId } = useParams();
  const navigate = useNavigate();

  // filtros
  const [from, setFrom] = useState(dayjs().subtract(12, "month").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));

  // datos
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE = "http://127.0.0.1:8000/api"; // <- cambiá si es necesario

  const safe404 = (p) =>
    p.catch((e) => (e?.response?.status === 404 ? { data: [] } : Promise.reject(e)));

  // helper: intenta varias rutas hasta que alguna responda 200; ignora 404
  const tryEndpoints = async (paths) => {
    for (const p of paths) {
      try {
        const res = await axios.get(p);
        return Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      } catch (e) {
        if (e?.response?.status !== 404) throw e; // si no es 404, re-lanzamos
      }
    }
    return []; // si todas dieron 404, devolvemos vacío
  };

    // dentro del componente Trazabilidad
  const fetchRange = async () => {
    setLoading(true);

    const q = `?from=${from}&to=${to}`;

    const [siRes, coRes, taRes] = await Promise.allSettled([
      axios.get(`/api/siembras/por-lote/${loteId}/`),       // puede devolver objeto o 404
      axios.get(`/api/cosechas/por-lote/${loteId}/`),       // si no existe, cámbiala por tu real
      axios.get(`/api/tareas/por-lote/${loteId}/${q}`),     // nuevo endpoint
    ]);

    // SIEMBRA
    const siembras =
      siRes.status === "fulfilled"
        ? normalize(toArr(siRes.value.data), "SIEMBRA", {
            date: (x) => x.fecha,
            meta: (x) => `${x.cultivo || ""} ${x.variedad || ""}`.trim(),
          })
        : [];

    // COSECHA (suele ser array; si es 404 cae en vacío)
    const cosechas =
      coRes.status === "fulfilled"
        ? normalize(toArr(coRes.value.data), "COSECHA", {
            date: (x) => x.fecha,
            meta: (x) => x.rinde || "-",
          })
        : [];

    // TAREAS por lote en rango
    const tareas =
      taRes.status === "fulfilled"
        ? normalize(taRes.value.data, "OTRA", {
            date: (x) => x.fecha,
            meta: (x) => {
              // Mostramos tipo con algún dato útil
              const t = (x.tipo || "").toUpperCase();
              if (t === "FERTILIZACION") return `Fertilización: ${x.producto_aplicar || "-"}`;
              if (t === "RIEGO") return `Riego ${x.volumen ? `${x.volumen} L` : ""}`;
              if (t === "LABOREO") return `Laboreo de lote`;
              if (t === "MALEZA") return `Manejo de malezas`;
              if (t === "FITOSANITARIA") return `Aplicación fitosanitaria`;
              return x.tipo || "Tarea";
            },
          })
        : [];

    setEvents([...siembras, ...cosechas, ...tareas]);
    setLoading(false);
  };



  // carga inicial
  useEffect(() => {
    fetchRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId]);

  // filtro en cliente por rango
  const filtered = useMemo(() => {
    const fromD = parseDate(from)?.startOf("day");
    const toD = parseDate(to)?.endOf("day");
    return events
      .filter((ev) => {
        const d = parseDate(ev.date);
        if (!d || !fromD || !toD) return false;
        return (
          (d.isAfter(fromD) || d.isSame(fromD, "day")) &&
          (d.isBefore(toD) || d.isSame(toD, "day"))
        );
      })
      .sort((a, b) => {
        const da = parseDate(a.date);
        const db = parseDate(b.date);
        return (da ? da.valueOf() : 0) - (db ? db.valueOf() : 0);
      });
  }, [events, from, to]);

  const cols = 4;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "rgb(239, 254, 238)" }}>
      {/* Header + filtros */}
      <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
        <button className="btn btn-outline-success" onClick={() => navigate(`/lote/${loteId}`)}>
          Actual
        </button>

        <div className="ms-auto d-flex align-items-center flex-wrap gap-3">
          <div className="filter-chip">
            <span className="chip-label">Desde</span>
            <input
              type="date"
              className="form-control form-control-sm chip-input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="filter-chip">
            <span className="chip-label">Hasta</span>
            <input
              type="date"
              className="form-control form-control-sm chip-input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button className="btn btn-success" onClick={fetchRange}>
            Buscar en rango
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              // resetea a último año y vacía resultados
              setFrom(dayjs().subtract(12, "month").format("YYYY-MM-DD"));
              setTo(dayjs().format("YYYY-MM-DD"));
              setEvents([]);
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {loading && <div className="text-muted">Cargando trazabilidad…</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-muted">No hay eventos en el rango seleccionado.</div>
      )}

      {/* grilla tipo flujo */}
      <div className="flow-grid mt-3">
        {filtered.map((ev, idx) => {
          const color = TYPE_META[ev.type]?.color || "#eee";
          const fecha = parseDate(ev.date)?.format("DD MMMM YYYY") || ev.date;

          const isEndOfRow = (idx + 1) % cols === 0;
          const isLast = idx === filtered.length - 1;

          return (
            <div key={`${ev.type}-${ev.id}`} className="flow-cell">
              <div className="flow-card" style={{ backgroundColor: color }}>
                <div className="flow-title">{ev.title}</div>
                <div className="flow-date">{fecha}</div>
                {ev.meta && <div className="flow-meta">{ev.meta}</div>}

                <button
                  className="btn btn-outline-success btn-sm mt-2"
                  onClick={() => console.log("VER:", ev)}
                >
                  Ver
                </button>
              </div>

              {!isLast && (
                <>
                  {!isEndOfRow ? (
                    <FaArrowRight className="arrow-right" />
                  ) : (
                    <FaArrowDown className="arrow-down" />
                  )}
                  {isEndOfRow && idx + 1 < filtered.length && <FaArrowLeft className="arrow-left-hint" />}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
