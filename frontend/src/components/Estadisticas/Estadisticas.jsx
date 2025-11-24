import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
// ⚠️ Ajustá la ruta del logo según tu estructura
import logoTerrax from "./logo_terrax.png";

const TX_GREEN = "#198754";

export default function Estadisticas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [countAlertas, setCountAlertas] = useState(0);
  const [countReportes, setCountReportes] = useState(0);
  const [countTareas, setCountTareas] = useState(0);
  const [countSiembrasPend, setCountSiembrasPend] = useState(0);
  const [countAnotaciones, setCountAnotaciones] = useState(0);

  // Nuevos contadores solicitados
  const [countCampos, setCountCampos] = useState(0);
  const [countLotes, setCountLotes] = useState(0);
  const [countProductosEnStock, setCountProductosEnStock] = useState(0);
  const [
    countCultivosConMaduracionPendiente,
    setCountCultivosConMaduracionPendiente,
  ] = useState(0);
  const [countCultivosNoMadurados, setCountCultivosNoMadurados] = useState(0);

  // 🆕 Días desde que se registró el usuario
  const [daysSinceRegistered, setDaysSinceRegistered] = useState(null);

  const token = localStorage.getItem("accessToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  useEffect(
    () => {
      let mounted = true;

      const parseDateSafe = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? null : d;
      };

      const fetchAll = async () => {
        setLoading(true);
        setError("");

        try {
          // -------------------------------------------------------------------
          // Reportes, tareas, siembras, anotaciones, alertas
          // -------------------------------------------------------------------
          let reportes = [];
          try {
            const r = await axios.get("/api/reportes/", { headers });
            reportes = Array.isArray(r.data) ? r.data : r.data.results ?? [];
            if (mounted) setCountReportes(reportes.length);
          } catch {
            if (mounted) setCountReportes(0);
          }

          try {
            const r = await axios.get("/api/tareas/", { headers });
            const tareas = Array.isArray(r.data)
              ? r.data
              : r.data.results ?? [];
            if (mounted) setCountTareas(tareas.length);
          } catch {
            if (mounted) setCountTareas(0);
          }

          try {
            const r = await axios.get("/api/siembras/", { headers });
            const siembras = Array.isArray(r.data)
              ? r.data
              : r.data.results ?? [];
            const pendientes = siembras.filter((s) => {
              if (s.estado) {
                const st = String(s.estado).toLowerCase();
                return ![
                  "finalizado",
                  "finalizada",
                  "completado",
                  "completa",
                  "done",
                ].includes(st);
              }
              if (typeof s.completada === "boolean") return !s.completada;
              if (s.pendiente !== undefined) return Boolean(s.pendiente);
              return true;
            });
            if (mounted) setCountSiembrasPend(pendientes.length);
          } catch {
            if (mounted) setCountSiembrasPend(0);
          }

          try {
            const r = await axios.get("/api/anotaciones/", { headers });
            const anotaciones = Array.isArray(r.data)
              ? r.data
              : r.data.results ?? [];
            if (mounted) setCountAnotaciones(anotaciones.length);
          } catch {
            // fallback: sumar por reportes (como antes)
            let suma = 0;
            try {
              if (
                reportes.length &&
                reportes[0] &&
                reportes[0].anotaciones_count != null
              ) {
                suma = reportes.reduce(
                  (acc, x) => acc + (Number(x.anotaciones_count) || 0),
                  0
                );
                if (mounted) setCountAnotaciones(suma);
              } else {
                const MAX = 30;
                const slice = reportes.slice(0, MAX);
                const promises = slice.map((rp) =>
                  axios
                    .get(`/api/reportes/${rp.id}/anotaciones/`, { headers })
                    .then((res) =>
                      Array.isArray(res.data)
                        ? res.data.length
                        : res.data.count ?? 0
                    )
                    .catch(() => 0)
                );
                const results = await Promise.all(promises);
                suma = results.reduce((a, b) => a + b, 0);
                if (reportes.length > MAX) {
                  const avg = results.length
                    ? results.reduce((a, b) => a + b, 0) / results.length
                    : 0;
                  suma = Math.round(avg * reportes.length);
                }
                if (mounted) setCountAnotaciones(suma);
              }
            } catch {
              if (mounted) setCountAnotaciones(0);
            }
          }

          try {
            const r = await axios.get("/api/alertas/", { headers });
            const data = Array.isArray(r.data) ? r.data : r.data.results ?? [];
            if (mounted) setCountAlertas(data.length);
          } catch {
            // fallback por lotes
            try {
              const rl = await axios.get("/api/lotes/", { headers });
              const lotes = Array.isArray(rl.data)
                ? rl.data
                : rl.data.results ?? [];
              const MAX_LOTES = 40;
              const slice = lotes.slice(0, MAX_LOTES);
              const promises = slice.map((l) =>
                axios
                  .get(`/api/lotes/${l.id}/alertas/`, { headers })
                  .then((res) => {
                    if (Array.isArray(res.data)) return res.data.length;
                    if (Array.isArray(res.data.alertas))
                      return res.data.alertas.length;
                    return res.data.count ?? 0;
                  })
                  .catch(() => 0)
              );
              const results = await Promise.all(promises);
              let total = results.reduce((a, b) => a + b, 0);
              if (lotes.length > MAX_LOTES) {
                const avg = results.length
                  ? results.reduce((a, b) => a + b, 0) / results.length
                  : 0;
                total = Math.round(avg * lotes.length);
              }
              if (mounted) setCountAlertas(total);
            } catch {
              if (mounted) setCountAlertas(0);
            }
          }

          // -------------------------------------------------------------------
          // Nuevos: campos, lotes, productos en stock
          // -------------------------------------------------------------------
          try {
            const rc = await axios.get("/api/campos/", { headers });
            const arr = Array.isArray(rc.data)
              ? rc.data
              : rc.data.results ?? [];
            if (mounted) setCountCampos(arr.length);
          } catch {
            if (mounted) setCountCampos(0);
          }

          let fetchedLotes = [];
          try {
            const rl = await axios.get("/api/lotes/", { headers });
            const arr = Array.isArray(rl.data)
              ? rl.data
              : rl.data.results ?? [];
            fetchedLotes = arr;
            if (mounted) setCountLotes(arr.length);
          } catch {
            if (mounted) setCountLotes(0);
          }

          try {
            const rp = await axios.get("/api/productos/", { headers });
            const productos = Array.isArray(rp.data)
              ? rp.data
              : rp.data.results ?? [];
            let enStockCount = 0;
            if (
              productos.length &&
              ("stock" in productos[0] || "cantidad" in productos[0])
            ) {
              enStockCount = productos.reduce((acc, p) => {
                const s = Number(p.stock ?? p.cantidad ?? 0);
                return acc + (s > 0 ? 1 : 0);
              }, 0);
            } else if (rp.data.count != null) {
              enStockCount = rp.data.count;
            } else {
              enStockCount = productos.length;
            }
            if (mounted) setCountProductosEnStock(enStockCount);
          } catch {
            if (mounted) setCountProductosEnStock(0);
          }

          // -------------------------------------------------------------------
          // Cultivos: heurísticas para maduración pendiente / no maduros
          // -------------------------------------------------------------------
          let posibles = [];
          try {
            const rc = await axios.get("/api/cultivos/", { headers });
            posibles = Array.isArray(rc.data) ? rc.data : rc.data.results ?? [];
          } catch {
            try {
              const rs = await axios.get("/api/siembras/", { headers });
              posibles = Array.isArray(rs.data)
                ? rs.data
                : rs.data.results ?? [];
            } catch {
              posibles = fetchedLotes.slice(0, 200);
            }
          }

          try {
            const today = new Date();
            let pendientesMaduracion = 0;
            let noMadurados = 0;

            posibles.forEach((item) => {
              const dateFields = [
                "fecha_maduracion",
                "fecha_estimada_maduracion",
                "fecha_cosecha",
                "fecha_prevista_maduracion",
                "fecha_prevista",
                "fecha_fin",
                "fecha",
              ];
              let fecha = null;
              for (const f of dateFields) {
                if (item[f]) {
                  fecha = parseDateSafe(item[f]);
                  if (fecha) break;
                }
              }
              const estado = (
                item.estado ||
                item.estado_cultivo ||
                item.status ||
                ""
              )
                .toString()
                .toLowerCase();
              const estaMaduro = [
                "maduro",
                "maduros",
                "cosechado",
                "finalizado",
                "completo",
              ].some((s) => estado.includes(s));

              if (fecha && fecha > today) {
                pendientesMaduracion += 1;
              }
              if (!estaMaduro) {
                noMadurados += 1;
              }
            });

            if (mounted) {
              setCountCultivosConMaduracionPendiente(pendientesMaduracion);
              setCountCultivosNoMadurados(noMadurados);
            }
          } catch {
            if (mounted) {
              setCountCultivosConMaduracionPendiente(0);
              setCountCultivosNoMadurados(0);
            }
          }

          // -------------------------------------------------------------------
          // Días desde registro del usuario (usa fecha_alta del backend)
          // -------------------------------------------------------------------
          try {
            const ru = await axios.get("/api/usuarios/", { headers });

            console.log("usuarios para estadisticas", ru.data);

            let user = null;

            if (Array.isArray(ru.data)) {
              // por ahora usamos el primero de la lista
              user = ru.data[0];
            } else if (ru.data && Array.isArray(ru.data.results)) {
              user = ru.data.results[0];
            } else {
              user = ru.data;
            }

            const fechaRegistro = user?.fecha_alta; // 👈 clave

            if (fechaRegistro && mounted) {
              const registro = new Date(fechaRegistro);
              if (!Number.isNaN(registro.getTime())) {
                const diffMs = Date.now() - registro.getTime();
                const diffDays = Math.max(
                  0,
                  Math.floor(diffMs / (1000 * 60 * 60 * 24))
                );
                setDaysSinceRegistered(diffDays);
              } else {
                setDaysSinceRegistered(null);
              }
            } else if (mounted) {
              setDaysSinceRegistered(null);
            }
          } catch (err) {
            console.error("Error obteniendo usuario para días de uso:", err);
            if (mounted) setDaysSinceRegistered(null);
          }
        } catch (e) {
          console.error(e);
          if (mounted) setError("Error cargando estadísticas");
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchAll();
      return () => {
        mounted = false;
      };
    },
    [
      /* sin deps */
    ]
  );

  const refresh = () => {
    setLoading(true);
    setError("");
    window.location.reload();
  };

  // 🔢 Terrax Points = suma de todos los contadores
  const terraxPoints =
    countAlertas +
    countReportes +
    countTareas +
    countSiembrasPend +
    countAnotaciones +
    countCampos +
    countLotes +
    countProductosEnStock +
    countCultivosConMaduracionPendiente +
    countCultivosNoMadurados;

  return (
    <div className="terrax-card mx-auto my-4 p-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Mis Estadísticas</h4>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {/* 🌟 Terrax Points */}
        <div className="col-12">
          <div
            className="p-3 border rounded d-flex justify-content-between align-items-center"
            style={{
              background: TX_GREEN,
              color: "#fff",
              boxShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.1)",
            }}
          >
            <div>
              <div className="small text-uppercase fw-semibold">
                Terrax Points
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>
                {terraxPoints}
              </div>
              <div className="small">
                Suma de todas tus métricas de uso en Terrax
              </div>
            </div>

            {/* 🖼️ Logo + texto de detalle */}
            <div className="d-flex align-items-center gap-3">
              <div className="text-end small">
                <div>Puntos de Actividad:</div>
                <div>Alertas, reportes, tareas, siembras,</div>
                <div>anotaciones, campos, lotes, productos y cultivos.</div>
              </div>
              <img
                src={logoTerrax}
                alt="Terrax"
                style={{ height: 56, width: "auto" }}
              />
            </div>
          </div>
        </div>

        {/* 🆕 Días desde que se registró */}
        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#e9f5ff" }}>
            <div className="small text-muted">Días usando Terrax</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f4fa3" }}>
              {daysSinceRegistered ?? "-"}
            </div>
            <div className="text-muted small">
              Desde tu fecha de registro en el sistema
            </div>
          </div>
        </div>

        {/* Resto de cards existentes */}
        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#f8fff8" }}>
            <div className="small text-muted">Alertas Climáticas</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TX_GREEN }}>
              {countAlertas}
            </div>
            <div className="text-muted small">Total de alertas</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#fff" }}>
            <div className="small text-muted">Reportes Subidos</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f5132" }}>
              {countReportes}
            </div>
            <div className="text-muted small">
              Reportes registrados en el sistema
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#fff8f3" }}>
            <div className="small text-muted">Tareas Registradas</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#6b4f1d" }}>
              {countTareas}
            </div>
            <div className="text-muted small">Incluye todas las tareas</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#eef7ff" }}>
            <div className="small text-muted">Siembras Pendientes</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#235b89" }}>
              {countSiembrasPend}
            </div>
            <div className="text-muted small">Siembras no finalizadas</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#fff" }}>
            <div className="small text-muted">Anotaciones</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#19362bff",
              }}
            >
              {countAnotaciones}
            </div>
            <div className="text-muted small">
              Comentarios / anotaciones en Reportes
            </div>
          </div>
        </div>

        {/* Nuevos cards añadidos */}
        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#f6fff8" }}>
            <div className="small text-muted">Campos Registrados</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0b6b3a" }}>
              {countCampos}
            </div>
            <div className="text-muted small">
              Total de campos en el sistema
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#fffaf6" }}>
            <div className="small text-muted">Lotes</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#7a4b12" }}>
              {countLotes}
            </div>
            <div className="text-muted small">Lotes registrados</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 border rounded" style={{ background: "#f0fff9" }}>
            <div className="small text-muted">Productos Registrados</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1f6f3e" }}>
              {countProductosEnStock}
            </div>
            <div className="text-muted small">
              Productos con stock disponible
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 border rounded" style={{ background: "#f3f9ff" }}>
            <div className="small text-muted">
              Cultivos que todavía no maduraron
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0f4fa3" }}>
              {countCultivosNoMadurados}
            </div>
            <div className="text-muted small">
              Estimación de cultivos no maduros
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
