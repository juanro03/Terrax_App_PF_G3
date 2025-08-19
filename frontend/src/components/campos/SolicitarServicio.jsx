import React, { useState } from "react";
import "./SolicitarServicio.css";

const SolicitarServicio = ({ onClose }) => {
  const [tipoTarea, setTipoTarea] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      tipoTarea,
      fechaInicio,
      fechaFin,
    };

    try {
      const response = await fetch("http://localhost:8000/api/solicitar-servicio/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Solicitud enviada con éxito.");
        onClose();
      } else {
        alert("Error al enviar solicitud.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h2>Solicitar Servicio</h2>
        <form onSubmit={handleSubmit}>
          <label>Tipo de tarea:</label>
          <select value={tipoTarea} onChange={(e) => setTipoTarea(e.target.value)} required>
            <option value="">Seleccione una opción</option>
            <option value="Cobertura">Cobertura</option>
            <option value="Cosecha">Cosecha</option>
            <option value="Fertilización">Fertilización</option>
            <option value="Manejo de suelo">Manejo de suelo</option>
            <option value="Pulverización">Pulverizacion</option>
            <option value="Riego">Riego</option>
            <option value="Siembra">Siembra</option>
            
            
            
            
          </select>

          <label>Fecha inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />

          <label>Fecha fin:</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            min={fechaInicio || new Date().toISOString().split("T")[0]}
            required
          />

          <div className="modal-botones">
            <button type="submit" className="btn-enviar">Enviar</button>
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolicitarServicio;

