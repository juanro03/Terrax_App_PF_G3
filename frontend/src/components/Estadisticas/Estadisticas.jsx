import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/dashboardservice";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
      }
    }
    fetchData();
  }, []);

  if (!stats) return <p>Cargando dashboard...</p>;

  // -----------------------------
  // DATA PARA GRÁFICOS
  // -----------------------------
  const activitiesLabels = stats.activities.by_month.map((x) => x.month);
  const activitiesCounts = stats.activities.by_month.map((x) => x.count);

  const reportsLabels = stats.reports.by_month.map((x) => x.month);
  const reportsCounts = stats.reports.by_month.map((x) => x.count);

  return (
    <div className="container mt-4">
      {/* ---------- TARJETAS SUPERIORES ---------- */}
      <h2 className="mb-4">Dashboard Administrativo</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Usuarios Totales</h5>
            <h2>{stats.users.total}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Actividades</h5>
            <h2>{stats.activities.total}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Reportes</h5>
            <h2>{stats.reports.total}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Solicitudes Servicio</h5>
            <h2>{stats.service_requests.total}</h2>
          </div>
        </div>
      </div>

      {/* ---------- GRAFICO: ACTIVIDADES POR MES ---------- */}
      <div className="card p-4 shadow mb-4">
        <h4 className="mb-3">Actividades por Mes</h4>
        <Line
          data={{
            labels: activitiesLabels,
            datasets: [
              {
                label: "Actividades",
                data: activitiesCounts,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
              },
            ],
          }}
        />
      </div>

      {/* ---------- GRAFICO: REPORTES POR MES ---------- */}
      <div className="card p-4 shadow mb-4">
        <h4 className="mb-3">Reportes por Mes</h4>
        <Line
          data={{
            labels: reportsLabels,
            datasets: [
              {
                label: "Reportes",
                data: reportsCounts,
                borderColor: "rgb(153, 102, 255)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
              },
            ],
          }}
        />
      </div>

      {/* ---------- TABLA: SOLICITUDES DE SERVICIO POR USUARIO ---------- */}
      <div className="card p-4 shadow mb-4">
        <h4 className="mb-3">Solicitudes de Servicio por Usuario</h4>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Total solicitudes</th>
            </tr>
          </thead>

          <tbody>
            {stats.service_requests.by_user.map((u, i) => (
              <tr key={i}>
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
    </div>
  );
}
