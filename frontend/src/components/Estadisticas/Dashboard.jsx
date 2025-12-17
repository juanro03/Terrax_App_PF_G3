import React, { useEffect, useMemo, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { getDashboardStats } from "../../services/dashboardservice";
import axios from "axios";

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

/* =======================
   🎨 UI TOKENS
======================= */
const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0px 4px 12px rgba(0,0,0,0.07)",
};

const TIPO_TAREA_LABELS = {
  fertilizacion: "Fertilización",
  maleza: "Manejo de Malezas",
  laboreo: "Laboreos de Lote",
  riego: "Riego",
  fitosanitaria: "Aplicación Fitosanitaria",
  otra: "Otra",
};

const dashboardWrapper = {
  marginLeft: "20px",
  padding: "24px",
  minHeight: "100vh",
  background: "#F1F8E9",
  boxSizing: "border-box",
};

const kpiNumber = {
  fontSize: "2rem",
  fontWeight: 700,
  color: "#2E7D32",
};

/* =======================
   ⏱️ Helper: días de uso
======================= */
const calcularDiasUso = (fechaAlta) => {
  if (!fechaAlta) return "-";
  const inicio = new Date(fechaAlta);
  const hoy = new Date();
  const diffMs = hoy - inicio;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  // NUEVO
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [mostrarGraficoNotificaciones, setMostrarGraficoNotificaciones] =
    useState(false);

  const [mostrarActivos, setMostrarActivos] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [mostrarDetalleTareas, setMostrarDetalleTareas] = useState(false);

  // Modal Doble Confirmación
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  /* =======================
     DATA FETCH
  ======================= */
  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error dashboard:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/usuarios/")
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error("Error usuarios:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    axios
      .get("http://localhost:8000/api/tareas/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTareas(res.data))
      .catch((err) =>
        console.error(
          "❌ Error tareas:",
          err.response?.status,
          err.response?.data
        )
      );
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/notificaciones-mora/")
      .then((res) => setNotificaciones(res.data))
      .catch((err) => console.error("Error notificaciones:", err));
  }, []);

  /* =======================
     CHECKBOX HANDLER
  ======================= */
  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* =======================
     DERIVED DATA
  ======================= */
  const filteredActivities = useMemo(() => tareas, [tareas]);

  const tareasPorTipo = useMemo(() => {
    const map = {};
    filteredActivities.forEach((a) => {
      const label = TIPO_TAREA_LABELS[a.tipo] || a.tipo;
      map[label] = (map[label] || 0) + 1;
    });
    return { labels: Object.keys(map), values: Object.values(map) };
  }, [filteredActivities]);

  const usuariosActivos = usuarios.filter((u) => u.is_active);
  const usuariosInactivos = usuarios.filter((u) => !u.is_active);

  /* =======================
   GRAFICO NOTIFICACIONES (AGRUPADO)
======================= */
  const graficoNotificaciones = useMemo(() => {
    const conteoPorFecha = {};

    // Agrupar notificaciones por fecha
    notificaciones.forEach((n) => {
      const fecha = n.fecha.slice(0, 10);
      conteoPorFecha[fecha] = (conteoPorFecha[fecha] || 0) + 1;
    });

    const labels = Object.keys(conteoPorFecha);
    const values = Object.values(conteoPorFecha);

    return {
      labels,
      datasets: [
        {
          label: "Notificaciones enviadas",
          data: values,
          backgroundColor: "#66BB6A",
          borderRadius: 6,
        },
      ],
    };
  }, [notificaciones]);

  if (!stats) return <p className="text-center mt-5">Cargando dashboard…</p>;

  return (
    <div style={dashboardWrapper}>
      {/* TÍTULO */}
      <h2 style={{ fontWeight: 700, color: "#2E7D32", marginBottom: "24px" }}>
        Gestión de Usuarios
      </h2>

      {/* =======================
          KPIs
      ======================= */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div
            style={{ ...cardStyle, cursor: "pointer" }}
            onClick={() => setMostrarActivos((p) => !p)}
          >
            <h6 className="text-muted">Usuarios Activos</h6>
            <div style={kpiNumber}>{stats.users.active}</div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div
            style={{ ...cardStyle, cursor: "pointer" }}
            onClick={() => setMostrarInactivos((p) => !p)}
          >
            <h6 className="text-muted">Usuarios Inactivos</h6>
            <div style={{ ...kpiNumber, color: "#C62828" }}>
              {stats.users.inactive}
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div style={cardStyle}>
            <h6 className="text-muted">Total Actividades</h6>
            <div style={kpiNumber}>{stats.activities.total}</div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div style={cardStyle}>
            <h6 className="text-muted">Reportes Subidos</h6>
            <div style={kpiNumber}>{stats.reports.total}</div>
          </div>
        </div>
      </div>

      {/* =======================
          TABLAS USUARIOS
      ======================= */}
      {mostrarActivos && (
        <div style={cardStyle} className="mb-4">
          <h6 className="mb-3">Usuarios Activos</h6>
          <table className="table table-hover table-sm">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha Alta</th>
                <th>Días de uso</th>
              </tr>
            </thead>
            <tbody>
              {usuariosActivos.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.first_name} {u.last_name}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>{u.fecha_alta?.slice(0, 10)}</td>
                  <td>
                    <span
                      className={
                        calcularDiasUso(u.fecha_alta) < 7
                          ? "badge bg-success"
                          : "badge bg-secondary"
                      }
                    >
                      {calcularDiasUso(u.fecha_alta)} días
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarInactivos && (
        <div style={cardStyle} className="mb-4">
          <h6 className="mb-3">Usuarios Inactivos</h6>
          <table className="table table-hover table-sm">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha Alta</th>
              </tr>
            </thead>
            <tbody>
              {usuariosInactivos.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.first_name} {u.last_name}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>{u.fecha_alta?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =======================
          ACTIVIDADES
      ======================= */}
      <div style={cardStyle} className="mb-4">
        <h6 className="mb-3">Actividades</h6>

        <div style={{ height: 220 }}>
          <Line
            data={{
              labels: stats.activities.by_month.map((m) => m.month),
              datasets: [
                {
                  data: stats.activities.by_month.map((m) => m.count),
                  borderColor: "#2E7D32",
                  backgroundColor: "rgba(46,125,50,.15)",
                  borderWidth: 2,
                  tension: 0.35,
                  pointRadius: 4,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        <div className="text-end mt-3">
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => setMostrarDetalleTareas((p) => !p)}
          >
            {mostrarDetalleTareas
              ? "Ocultar detalle de tareas"
              : "Más info de tareas"}
          </button>
        </div>

        {mostrarDetalleTareas && (
          <div className="mt-4" style={{ height: 260 }}>
            <h6 className="mb-3">Actividades por tipo</h6>
            <Bar
              data={{
                labels: tareasPorTipo.labels,
                datasets: [
                  {
                    data: tareasPorTipo.values,
                    backgroundColor: [
                      "#2E7D32",
                      "#388E3C",
                      "#66BB6A",
                      "#81C784",
                      "#A5D6A7",
                    ],
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </div>
        )}
      </div>

      {/* =======================
          SOLICITUDES
      ======================= */}
      <div style={cardStyle} className="mb-4">
        <h6 className="mb-3">Solicitudes de Servicio por Usuario</h6>
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.service_requests.by_user.map((u) => (
              <tr key={u.user_id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <strong>{u.total}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =======================
          NOTIFICACIONES MORA
      ======================= */}
      <div style={cardStyle} className="mt-4">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-3">Notificaciones de Mora - Pendientes</h6>

          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => setMostrarGraficoNotificaciones((p) => !p)}
          >
            {mostrarGraficoNotificaciones
              ? "Ocultar estadísticas"
              : "Más info de notificaciones"}
          </button>
        </div>

        {/* Tabla */}
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th></th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Fecha</th>
              <th>Cant. Notificaciones</th>
            </tr>
          </thead>

          <tbody>
            {notificaciones.map((n) => {
              const usuario = usuarios.find((u) => u.id === n.usuario);
              const cantidad = notificaciones.filter(
                (x) => x.usuario === n.usuario
              ).length;

              return (
                <tr key={n.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(n.id)}
                      onChange={() => toggleSeleccion(n.id)}
                    />
                  </td>
                  <td>
                    {usuario?.first_name} {usuario?.last_name}
                  </td>
                  <td>{usuario?.email}</td>
                  <td>{n.fecha.slice(0, 10)}</td>
                  <td>
                    <strong>{cantidad}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Botón eliminar */}
        <button
          className="btn btn-danger btn-sm mt-2"
          disabled={seleccionadas.length === 0}
          onClick={() => setShowModal1(true)}
        >
          Eliminar seleccionadas
        </button>

        {/* GRÁFICO */}
        {mostrarGraficoNotificaciones && (
          <div className="mt-4" style={{ height: 260 }}>
            <Bar
              data={graficoNotificaciones}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        )}
      </div>

      {/* =======================================
          MODAL 1 — primera confirmación
      ======================================= */}
      {showModal1 && (
        <div
          className="modal-backdrop fade show"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "420px",
              boxShadow: "0px 4px 18px rgba(0,0,0,0.15)",
            }}
          >
            <h5 className="fw-bold mb-2">
              ¿Deseas continuar con la eliminación?
            </h5>

            <p className="mb-3">
              Seleccionaste <strong>{seleccionadas.length}</strong>{" "}
              notificaciones.
            </p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowModal1(false)}
              >
                Cancelar
              </button>

              <button
                className="btn btn-danger"
                onClick={() => {
                  setShowModal1(false);
                  setShowModal2(true);
                }}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================
          MODAL 2 — confirmación irreversible
      ======================================= */}
      {showModal2 && (
        <div
          className="modal-backdrop fade show"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "420px",
              boxShadow: "0px 4px 18px rgba(0,0,0,0.15)",
            }}
          >
            <h5 className="fw-bold mb-2">
              Confirmación final — acción irreversible
            </h5>

            <p className="mb-3">
              Se eliminarán permanentemente{" "}
              <strong>{seleccionadas.length}</strong> notificaciones.
            </p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowModal2(false)}
              >
                Cancelar
              </button>

              <button
                className="btn btn-danger"
                onClick={() => {
                  axios
                    .delete(
                      "http://localhost:8000/api/notificaciones-mora/eliminar/",
                      {
                        data: { ids: seleccionadas },
                      }
                    )
                    .then(() => {
                      setNotificaciones((prev) =>
                        prev.filter((n) => !seleccionadas.includes(n.id))
                      );
                      setSeleccionadas([]);
                      setShowModal2(false);
                    });
                }}
              >
                Sí, eliminar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
