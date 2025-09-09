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
  const [mensaje, setMensaje] = useState("");

  // Cargar campos al iniciar
  useEffect(() => {
    axios
      .get("/api/campos/")
      .then((r) => setCampos(r.data))
      .catch((err) => {
        console.error("Error al cargar campos:", err);
        setMensaje("No se pudieron cargar los campos");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      campo, // id del campo
      tipoTarea,
      fechaInicio,
      fechaFin,
      observaciones, // 👈 agregado
    };

    try {
      const res = await axios.post("/api/solicitar-servicio/", data);

      if (res.status === 200) {
        setMensaje("Solicitud enviada con éxito ✅");
        setTimeout(() => {
          setMensaje("");
          onClose();
        }, 2500);
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMensaje("Error al enviar la solicitud ❌");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h2>Solicitar Servicio</h2>

        {mensaje && (
          <div
            className={`alert ${
              mensaje.includes("éxito") ? "alert-success" : "alert-danger"
            }`}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selección de campo */}
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
            <option value="Cobertura">Cobertura</option>
            <option value="Cosecha">Cosecha</option>
            <option value="Fertilización">Fertilización</option>
            <option value="Manejo de suelo">Manejo de suelo</option>
            <option value="Pulverización">Pulverización</option>
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

          <label>Observaciones:</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows="4"
            placeholder="Escriba aquí cualquier detalle adicional..."
            style={{
              width: "100%",         //  mismo ancho que selects/inputs
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontFamily: "inherit",
              fontSize: "1rem",
              resize: "vertical",    //  deja redimensionar solo en altura
            }}
          />

          <div className="modal-botones">
            <button type="submit" className="btn-enviar">
              Enviar
            </button>
            <button type="button" onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

