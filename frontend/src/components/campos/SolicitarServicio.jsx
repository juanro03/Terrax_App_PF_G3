import React, { useState } from "react";

export default function SolicitarServicio({ campoId, onSuccess }) {
  const [tipoTarea, setTipoTarea] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevaSolicitud = {
      id: Date.now(),
      usuario: "Usuario Demo",
      email: "demo@mail.com",
      campo: campoId || "Campo Demo",
      tipo_tarea: tipoTarea,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      observaciones,
      estado: "Pendiente",
      fecha_creacion: new Date().toISOString().slice(0, 10),
    };

    if (onSuccess) onSuccess(nuevaSolicitud);

    // reset
    setTipoTarea("");
    setFechaInicio("");
    setFechaFin("");
    setObservaciones("");

    alert("Solicitud enviada correctamente (mock)");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2">
        <label>Tipo de tarea</label>
        <input
          className="form-control"
          value={tipoTarea}
          onChange={(e) => setTipoTarea(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label>Fecha inicio</label>
        <input
          type="date"
          className="form-control"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label>Fecha fin</label>
        <input
          type="date"
          className="form-control"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>Observaciones</label>
        <textarea
          className="form-control"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <button className="btn btn-success">Solicitar servicio</button>
    </form>
  );
}
