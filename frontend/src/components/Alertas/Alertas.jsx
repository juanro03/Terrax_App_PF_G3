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

  /* =========================
     HELPERS FECHA / HORA
  ========================== */
  const formatearDia = (fechaISO) => {
    const f = new Date(fechaISO);
    return f.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatearHora = (fechaISO) => {
    const f = new Date(fechaISO);
    return f.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const labelTipoAlerta = (tipo) => {
    const map = {
      temp_alta: "Temperaturas Altas",
      temp_baja: "Temperaturas Bajas",
      viento_fuerte: "Vientos Fuertes",
      lluvia: "Lluvias",
      lluvia_fuerte: "Lluvias Fuertes",
      tormenta: "Tormenta",
      granizo: "Granizo",
    };

    return map[tipo] || tipo.replace("_", " ").toUpperCase();
  };

  /* =========================
     CARGA DE DATOS
  ========================== */
  useEffect(() => {
    axios.get("/api/campos/").then((r) => setCampos(r.data));
  }, []);

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

  /* =========================
     AGRUPAR POR DÍA
  ========================== */
  const alertasPorDia = alertas.reduce((acc, alerta) => {
    const fecha = alerta.fecha.split(" ")[0]; // YYYY-MM-DD
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(alerta);
    return acc;
  }, {});

  /* =========================
     DÍAS RESTANTES
  ========================== */
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

      {/* Ubicación */}
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

      {/* Campo */}
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

      {/* Lote */}
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

      {alertas.length === 0 && (
        <p className="text-muted">No hay alertas registradas.</p>
      )}

      {/* ===== AGRUPADAS POR DÍA ===== */}
      <div className="dias-grid">
        {Object.entries(alertasPorDia).map(([dia, alertasDelDia]) => {
          const al = alertasDelDia[0]; // 👈 solo una alerta por día
          const dias = diasHasta(al.fecha);

          return (
            <div key={dia} className="dia-card">
              <h5 className="dia-titulo">🌤 {formatearDia(dia)}</h5>

              <div className={`alerta-card alerta-${al.nivel}`}>
                <div className="alerta-header">
                  <strong>{labelTipoAlerta(al.tipo)}</strong>
                  <span className={`badge nivel-${al.nivel}`}>
                    {al.nivel.toUpperCase()}
                  </span>
                </div>

                {dias !== null && (
                  <div className={`dias-label dias-${al.nivel}`}>
                    EN {dias} DÍA{dias !== 1 ? "S" : ""}
                  </div>
                )}

                <p className="hora-alerta">⏰ {formatearHora(al.fecha)}</p>

                <p>{al.mensaje}</p>

                {al.valor !== undefined && al.valor !== null && (
                  <div className="valor-box">
                    <span className="valor-label">Valor detectado</span>
                    <span className="valor-numero">
                      {al.valor}
                      {al.tipo.includes("temp") && " °C"}
                      {al.tipo.includes("viento") && " km/h"}
                      {al.tipo.includes("lluvia") && " mm"}
                    </span>
                  </div>
                )}

                {al.icon && (
                  <img
                    alt="icono clima"
                    className="icono-clima"
                    src={`https://openweathermap.org/img/wn/${al.icon}@2x.png`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
