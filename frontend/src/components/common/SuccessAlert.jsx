// SuccessAlert.jsx
import React from "react";
import "./SuccessAlert.css"; // estilos que te dejo abajo

export default function SuccessAlert({ show, title, onClose }) {
  if (!show) return null;

  return (
    <div className="confirm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="confirm-card p-4">
        <h5 className="fw-bold mb-3">{title}</h5>

        <div className="d-flex justify-content-end">
          <button className="btn btn-success" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
