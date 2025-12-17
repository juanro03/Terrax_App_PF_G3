import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2ecc71", "#e74c3c"]; // Verde / Rojo para mejor contraste

const UsersPieChart = ({ data }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header">
        <h6 className="mb-0">Usuarios activos vs inactivos</h6>
      </div>

      <div className="card-body">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsersPieChart;
