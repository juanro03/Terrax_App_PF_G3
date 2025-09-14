import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import "./Anotaciones.css";

const API = "http://127.0.0.1:8000/api";

const Anotaciones = ({ reporteSel, loteSel, cargandoLote }) => {
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  const [pins, setPins] = useState([]);
  const [pendingPos, setPendingPos] = useState(null);

  // hovers independientes
  const [hoveredPinAside, setHoveredPinAside] = useState(null);
  const [hoveredPinModal, setHoveredPinModal] = useState(null);

  // placing independientes (aside vs modal)
  const [placingModeAside, setPlacingModeAside] = useState(false);
  const [placingModeModal, setPlacingModeModal] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);

  const [pinDraft, setPinDraft] = useState({ text: "", color: "#e74c3c" });
  const pinColors = [
    { value: "#e74c3c", label: "Rojo (alerta)" },
    { value: "#f1c40f", label: "Amarillo (atención)" },
    { value: "#2ecc71", label: "Verde (ok)" },
  ];

  const resolveUrl = (p) => {
    if (!p || typeof p !== "string") return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `http://127.0.0.1:8000${p.startsWith("/") ? "" : "/"}${p}`;
  };
  const getLoteImage = (l) => {
    if (!l) return null;
    const candidate = l.imagen_satelital || l.imagen_dron || null;
    return resolveUrl(candidate);
  };

  const getRelativeClick = (evt) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const xPct = ((evt.clientX - rect.left) / rect.width) * 100;
    const yPct = ((evt.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, xPct)), y: Math.max(0, Math.min(100, yPct)) };
  };

  // ================= API anotaciones por LOTE =================
  const fetchAnotaciones = async (loteId) => {
    if (!loteId) { setPins([]); return; }
    try {
      const { data } = await axios.get(`${API}/lotes/${loteId}/anotaciones/`, { headers });
      const mapped = data.map((a) => ({
        id: a.id,
        serverId: a.id,
        x: parseFloat(a.x_pct),
        y: parseFloat(a.y_pct),
        color: a.color,
        text: a.texto,
      }));
      setPins(mapped);
    } catch (e) {
      console.error("Error cargando anotaciones:", e);
      setPins([]);
    }
  };

  const createAnotacion = async (loteId, { x, y, color, text }) => {
    const payload = {
      lote: loteId, // opcional en body, el viewset toma lote_pk pero no molesta
      x_pct: Number(x.toFixed(2)),
      y_pct: Number(y.toFixed(2)),
      color,
      texto: text,
    };
    const { data } = await axios.post(`${API}/lotes/${loteId}/anotaciones/`, payload, { headers });
    return {
      id: data.id,
      serverId: data.id,
      x: parseFloat(data.x_pct),
      y: parseFloat(data.y_pct),
      color: data.color,
      text: data.texto,
    };
  };

  const deleteAnotacion = async (loteId, anotacionId) => {
    await axios.delete(`${API}/lotes/${loteId}/anotaciones/${anotacionId}/`, { headers });
  };

  // Cuando cambia el lote seleccionado, reseteo y cargo anotaciones del lote
  useEffect(() => {
    setPins([]);
    setPendingPos(null);
    setHoveredPinAside(null);
    setHoveredPinModal(null);
    setPlacingModeAside(false);
    setPlacingModeModal(false);
    if (loteSel?.id) fetchAnotaciones(loteSel.id);
  }, [loteSel?.id]);

  // Cerrar modal de expandir: limpio hover del modal
  useEffect(() => {
    if (!showRegModal) setHoveredPinModal(null);
  }, [showRegModal]);

  // Ícono PIN
  const PinSVG = ({ color = "#e74c3c" }) => (
    <svg viewBox="0 0 512 512" width="26" height="26" style={{ display: "block" }}>
      <path
        d="M256 0C156 0 75 81 75 181c0 110 128 215 170 326 5 13 22 13 27 0 42-111 170-216 170-326C437 81 356 0 256 0z"
        fill={color}
      />
      <circle cx="256" cy="181" r="70" fill="#ffffff" />
    </svg>
  );

  return (
    <>
      {/* Panel derecho */}
      <aside className="registros-col">
        <div className="registros-card">
          <div className="registros-header">Anotaciones</div>
          <div className="registros-body">
            {!reporteSel && (
              <div className="registros-placeholder">
                Seleccioná un reporte para ver sus anotaciones.
              </div>
            )}

            {reporteSel && (
              <>
                {/* CABECERA + BOTONES (ASIDE) */}
                <div className="registros-subhead">
                  <div className="rs-left">
                    <span className="bullet"></span>
                    {new Date(reporteSel.fecha_reporte).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}{" "}
                    — {reporteSel.nombre}
                  </div>
                  <div className="rs-right">
                    <button
                      type="button"
                      className={`btn btn-sm ${placingModeAside ? "btn-outline-danger" : "btn-success"} me-2`}
                      onClick={() => {
                        if (placingModeAside) {
                          setPlacingModeAside(false);
                          setPendingPos(null);
                          setPinDraft({ text: "", color: pinColors[0].value });
                        } else {
                          setPlacingModeAside(true);
                          setPendingPos(null);
                          setPinDraft({ text: "", color: pinColors[0].value });
                        }
                      }}
                    >
                      {placingModeAside ? "Cancelar" : "Agregar Anotación"}
                    </button>

                    {/* Oculto "Expandir" si estoy colocando pin en el aside */}
                    {!placingModeAside && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => {
                          setShowRegModal(true);
                          setHoveredPinAside(null);
                        }}
                      >
                        Expandir
                      </button>
                    )}
                  </div>
                </div>

                {/* IMAGEN (ASIDE) */}
                <div className="registros-imgWrap">
                  {cargandoLote ? (
                    <div className="registros-loading">Cargando imagen del lote…</div>
                  ) : getLoteImage(loteSel) ? (
                    <div
                      className={`pins-canvas ${placingModeAside ? "is-placing" : ""}`}
                      onClick={(e) => {
                        if (!placingModeAside) return;
                        const pos = getRelativeClick(e);
                        setPendingPos(pos);
                        setShowPinModal(true);
                        setPlacingModeAside(false);
                      }}
                    >
                      <img src={getLoteImage(loteSel)} alt="Mapa/imagen del lote" className="registros-img" />
                      {/* Pins (ASIDE) */}
                      {pins.map((p) => (
                        <div
                          key={p.id}
                          className={`pin ${hoveredPinAside === p.id ? "is-hovered" : ""}`}
                          style={{ left: `${p.x}%`, top: `${p.y}%` }}
                          onMouseEnter={() => !showRegModal && setHoveredPinAside(p.id)}
                          onMouseLeave={() => setHoveredPinAside(null)}
                        >
                          <div className="pin-icon">
                            <PinSVG color={p.color} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="registros-noimg">Sin imagen del lote</div>
                  )}
                </div>

                {/* AVISO ASIDE */}
                {placingModeAside && <div className="placing-hint under">Hacé click en la imagen para ubicar el pin…</div>}

                {/* Lista de comentarios (ASIDE) */}
                <div className="comentarios-list">
                  {pins.length === 0 ? (
                    <div className="comentario-empty">Sin anotaciones aún.</div>
                  ) : (
                    pins.map((p) => (
                      <div
                        key={p.id}
                        className={`comentario-row ${hoveredPinAside === p.id ? "is-hovered" : ""}`}
                        style={{ "--pinColor": p.color }}
                        onMouseEnter={() => !showRegModal && setHoveredPinAside(p.id)}
                        onMouseLeave={() => setHoveredPinAside(null)}
                      >
                        <span className="comentario-dot" style={{ background: p.color }} />
                        <span className="comentario-text">{p.text}</span>
                        <button
                          className="comentario-del"
                          onClick={async () => {
                            try {
                              if (p.serverId && loteSel?.id) {
                                await deleteAnotacion(loteSel.id, p.serverId);
                              }
                              setPins((prev) => prev.filter((x) => x.id !== p.id));
                            } catch (e) {
                              console.error("No se pudo eliminar la anotación:", e);
                              alert("No se pudo eliminar la anotación.");
                            }
                          }}
                          title="Eliminar"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {reporteSel.observaciones && <div className="registro-bubble warn">{reporteSel.observaciones}</div>}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Modal crear PIN */}
      <Modal
        show={showPinModal}
        onHide={() => {
          setShowPinModal(false);
          setPendingPos(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Agregar anotación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Comentario</label>
            <input
              type="text"
              className="form-control"
              value={pinDraft.text}
              onChange={(e) => setPinDraft({ ...pinDraft, text: e.target.value })}
              placeholder="Ingrese aquí su comentario"
              autoFocus
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Color</label>
            <div style={{ display: "flex", gap: 10 }}>
              {pinColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-pill ${pinDraft.color === c.value ? "selected" : ""}`}
                  style={{ background: c.value }}
                  onClick={() => setPinDraft({ ...pinDraft, color: c.value })}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPinModal(false);
              setPendingPos(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className={`btn btn-success `}
            onClick={async () => {
              try {
                if (!pinDraft.text.trim() || !pendingPos || !loteSel?.id) return;
                const created = await createAnotacion(loteSel.id, {
                  x: pendingPos.x,
                  y: pendingPos.y,
                  color: pinDraft.color,
                  text: pinDraft.text.trim(),
                });
                setPins((prev) => [...prev, created]);
                setShowPinModal(false);
                setPendingPos(null);
                setPinDraft({ text: "", color: "#e74c3c" });
              } catch (e) {
                console.error("No se pudo crear la anotación:", e);
                alert("No se pudo crear la anotación.");
              }
            }}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal expandir */}
      <Modal
        show={showRegModal}
        onHide={() => {
          setShowRegModal(false);
          setHoveredPinModal(null);
          setPlacingModeModal(false);
        }}
        size="xl"
        centered
        dialogClassName="registros-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Registros — {reporteSel?.nombre} ({reporteSel && new Date(reporteSel.fecha_reporte).toLocaleDateString("es-AR")})
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!reporteSel ? (
            <div className="registros-placeholder">Seleccioná un reporte para ver sus registros.</div>
          ) : (
            <>
              <div className="d-flex justify-content-end mb-2">
                <button
                  type="button"
                  className={`btn btn-sm ${placingModeModal ? "btn-outline-danger" : "btn-success"}`}
                  onClick={() => {
                    if (placingModeModal) {
                      setPlacingModeModal(false);
                      setPendingPos(null);
                      setPinDraft({ text: "", color: pinColors[0].value });
                    } else {
                      setPlacingModeModal(true);
                      setPendingPos(null);
                      setPinDraft({ text: "", color: pinColors[0].value });
                    }
                  }}
                >
                  {placingModeModal ? "Cancelar" : "Agregar Anotación"}
                </button>
              </div>

              <div className="registros-imgWrap registros-imgWrap--square">
                {cargandoLote ? (
                  <div className="registros-loading">Cargando imagen del lote…</div>
                ) : getLoteImage(loteSel) ? (
                  <div
                    className={`pins-canvas ${placingModeModal ? "is-placing" : ""}`}
                    onClick={(e) => {
                      if (!placingModeModal) return;
                      const pos = getRelativeClick(e);
                      setPendingPos(pos);
                      setShowPinModal(true);
                      setPlacingModeModal(false);
                    }}
                  >
                    <img src={getLoteImage(loteSel)} alt="Mapa/imagen del lote" className="registros-img registros-img--lg" />
                    {/* Pins (MODAL) */}
                    {pins.map((p) => (
                      <div
                        key={p.id}
                        className={`pin ${hoveredPinModal === p.id ? "is-hovered" : ""}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        onMouseEnter={() => setHoveredPinModal(p.id)}
                        onMouseLeave={() => setHoveredPinModal(null)}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <div className="pin-icon">
                          <PinSVG color={p.color} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="registros-noimg">Sin imagen del lote</div>
                )}
              </div>

              {/* AVISO MODAL */}
              {placingModeModal && <div className="placing-hint under">Hacé click en la imagen para ubicar el pin…</div>}

              {/* Lista de comentarios (MODAL) */}
              <div className="comentarios-list">
                {pins.length === 0 ? (
                  <div className="comentario-empty">Sin anotaciones aún.</div>
                ) : (
                  pins.map((p) => (
                    <div
                      key={`row-${p.id}`}
                      className={`comentario-row ${hoveredPinModal === p.id ? "is-hovered" : ""}`}
                      style={{ "--pinColor": p.color }}
                      onMouseEnter={() => setHoveredPinModal(p.id)}
                      onMouseLeave={() => setHoveredPinModal(null)}
                    >
                      <span className="comentario-dot" style={{ background: p.color }} />
                      <span className="comentario-text">{p.text}</span>
                      <button
                        className="comentario-del"
                        title="Eliminar"
                        onClick={async () => {
                          try {
                            if (p.serverId && loteSel?.id) {
                              await deleteAnotacion(loteSel.id, p.serverId);
                            }
                            setPins((prev) => prev.filter((x) => x.id !== p.id));
                          } catch (e) {
                            console.error("No se pudo eliminar la anotación:", e);
                            alert("No se pudo eliminar la anotación.");
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Anotaciones;
