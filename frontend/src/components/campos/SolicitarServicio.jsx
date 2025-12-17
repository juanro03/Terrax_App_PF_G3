// src/components/campos/SolicitarServicio.jsx
import React, { useState, useEffect } from "react";
import axios from "../../axiosconfig";
import "./SolicitarServicio.css";

export default function SolicitarServicio({ onClose }) {
  const [campos, setCampos] = useState([]);
  const [campo, setCampo] = useState("");
  const [tipoTarea, setTipoTarea] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/api/campos/")
      .then((r) => setCampos(r.data))
      .catch(() => setError("No se pudieron cargar los campos"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      campo,
      tipoTarea,
      fechaInicio,
      fechaFin,
      observaciones,
    };

    try {
      const res = await axios.post("/api/solicitar-servicio/", data);

      if (res.status === 200) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.error(err);
      setError("Error al enviar la solicitud ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <div className="modal-overlay">
        <div className="modal-contenido">
          <h2>Solicitar Servicio</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Campo:</label>
            <select
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
              required
            >
              <option value="">Seleccione un campo</option>
              {campos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <label>Tipo de tarea:</label>
            <select
              value={tipoTarea}
              onChange={(e) => setTipoTarea(e.target.value)}
              required
              disabled={!campo}
            >
              <option value="">Seleccione una opción</option>
              <option value="Fertilización">Fertilización</option>
              <option value="Pulverización">Pulverización</option>
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

            <label>Observaciones:</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows="4"
              placeholder="Escriba aquí cualquier detalle adicional..."
            />

            <div className="modal-botones">
              <button type="submit" className="btn-enviar" disabled={loading}>
                {loading ? <span className="spinner" /> : "Enviar"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-cancelar"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL ÉXITO */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-contenido success-modal">
            <h3>✅ Notificación enviada</h3>
            <p>La solicitud de servicio se envió correctamente.</p>
          </div>
        </div>
      )}
    </>
  );
}
