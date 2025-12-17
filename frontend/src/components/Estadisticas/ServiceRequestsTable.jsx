import React from "react";

const ServiceRequestsTable = ({ rows }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h6 className="mb-0">Solicitudes de servicio por usuario</h6>
      </div>

      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th className="text-end">Solicitudes</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center text-muted py-3">
                  No hay solicitudes registradas
                </td>
              </tr>
            )}

            {rows.map((row, i) => (
              <tr key={i}>
                <td>{row.name || "Usuario desconocido"}</td>
                <td>{row.email || "-"}</td>
                <td className="text-end">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceRequestsTable;
