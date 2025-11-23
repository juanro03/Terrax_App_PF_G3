import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./alertas.css";

export default function AlertasClimaticas() {
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [campoId, setCampoId] = useState("");
  const [loteId, setLoteId] = useState("");
  const [alertas, setAlertas] = useState([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState(null);

  // Cargar campos
  useEffect(() => {
    axios.get("/api/campos/").then((r) => setCampos(r.data));
  }, []);

  // Cargar lotes según campo
  useEffect(() => {
    if (!campoId) return;

    const campo = campos.find((c) => c.id === Number(campoId));
    setCampoSeleccionado(campo || null);

    axios.get(`/api/lotes/por-campo/${campoId}/`).then((r) => setLotes(r.data));
  }, [campoId, campos]);

  const obtenerAlertas = async () => {
    if (!loteId) return;
    const r = await axios.get(`/api/lotes/${loteId}/alertas/`);
    setAlertas(r.data.alertas);
  };

  // ===== Agrupa alertas por día =====
  const alertasPorDia = alertas.reduce((acc, alerta) => {
    const fecha = alerta.fecha.split(" ")[0]; // YYYY-MM-DD
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(alerta);
    return acc;
  }, {});

  // Calcula días restantes
  const diasHasta = (fechaISO) => {
    if (!fechaISO) return null;
    const hoy = new Date();
    const fecha = new Date(fechaISO);
    const diff = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  };

  return (
    <div className="terrax-card mx-auto p-4 mt-3">
      <h2 className="titulo">Alertas Climáticas</h2>

      {/* Tarjeta de ubicación */}
      {campoSeleccionado && (
        <div className="ubicacion-card">
          <div className="ubicacion-icono">📍</div>
          <div className="ubicacion-info">
            <span className="ubicacion-label">Ubicación del Campo</span>
            <span className="ubicacion-text">
              {campoSeleccionado.localidad}, {campoSeleccionado.provincia}
            </span>
          </div>
        </div>
      )}

      {/* Select Campo */}
      <label className="fw-bold">Campo</label>
      <select
        className="form-control"
        value={campoId}
        onChange={(e) => {
          setCampoId(e.target.value);
          setLoteId("");
          setLotes([]);
          setAlertas([]);
        }}
      >
        <option value="">Seleccionar campo</option>
        {campos.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      {/* Select Lote */}
      <label className="fw-bold mt-3">Lote</label>
      <select
        className="form-control"
        value={loteId}
        onChange={(e) => {
          setLoteId(e.target.value);
          setAlertas([]);
        }}
        disabled={!campoId}
      >
        <option value="">Seleccionar lote</option>
        {lotes.map((l) => (
          <option key={l.id} value={l.id}>
            {l.nombre}
          </option>
        ))}
      </select>
      <button className="btn btn-success mt-3" onClick={obtenerAlertas}>
        Actualizar Datos Meteorológicos
      </button>

      <h4 className="mt-3">Alertas encontradas</h4>

      {/* Si no hay alertas */}
      {alertas.length === 0 && (
        <p className="text-muted">No hay alertas registradas.</p>
      )}

      {/* ===== AGRUPADAS POR DÍA ===== */}
      {Object.entries(alertasPorDia).map(([dia, alertasDelDia]) => (
        <div key={dia} className="dia-group">
          {/* Título del día */}
          <h5 className="dia-titulo">🌤 {dia}</h5>

          {alertasDelDia.map((al, idx) => {
            const dias = diasHasta(al.fecha);

            return (
              <div className={`alerta-card alerta-${al.nivel}`} key={idx}>
                <div className="alerta-header">
                  <strong>{al.tipo.replace("_", " ").toUpperCase()}</strong>
                  <span className={`badge nivel-${al.nivel}`}>
                    {al.nivel.toUpperCase()}
                  </span>
                </div>

                {dias !== null && (
                  <div className={`dias-label dias-${al.nivel}`}>
                    EN {dias} DÍA{dias !== 1 ? "S" : ""}
                  </div>
                )}

                <p className="fecha">{al.fecha}</p>
                <p>{al.mensaje}</p>

                {al.valor !== null && (
                  <p>
                    <strong>Valor:</strong> {al.valor}
                    {al.tipo.includes("temp") ? " °C" : ""}
                  </p>
                )}

                {al.descripcion && (
                  <p className="text-muted">Condición: {al.descripcion}</p>
                )}

                {al.icon && (
                  <img
                    alt="icono clima"
                    className="icono-clima"
                    src={`https://openweathermap.org/img/wn/${al.icon}@2x.png`}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
