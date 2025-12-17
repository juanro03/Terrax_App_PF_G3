import React from "react";

const StatsCard = ({ title, value, subtitle }) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h6 className="text-muted text-uppercase mb-1">{title}</h6>
        <h2 className="fw-bold">{value}</h2>
        {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
