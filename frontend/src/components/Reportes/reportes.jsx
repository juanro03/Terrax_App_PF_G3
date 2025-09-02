import React, { useEffect, useState } from "react";
import axios from "axios";
import "./reportes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";

const API = "http://127.0.0.1:8000/api";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [campoSeleccionado, setCampoSeleccionado] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState("");
  const [rol, setRol] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);

  const [nuevoReporte, setNuevoReporte] = useState({
    productor: "",
    campo: "",
    lote: "",
    nombre: "",
    tipo_reporte: "",
    observaciones: "",
    archivo_pdf: null,
    fecha_reporte: "",
  });

  const [atributoFiltro, setAtributoFiltro] = useState("nombre");
  const [valorBusqueda, setValorBusqueda] = useState("");

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  // ====== selección y detalle de lote (panel derecho) ======
  const [reporteSel, setReporteSel] = useState(null);
  const [loteSel, setLoteSel] = useState(null);
  const [cargandoLote, setCargandoLote] = useState(false);

  // ---- Helpers de imagen ----
  const resolveUrl = (p) => {
    if (!p || typeof p !== "string") return null;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `http://127.0.0.1:8000${p.startsWith("/") ? "" : "/"}${p}`;
  };

  // Prioriza imagen_satelital y si no hay, usa imagen_dron
  const getLoteImage = (l) => {
    if (!l) return null;
    const candidate = l.imagen_satelital || l.imagen_dron || null;
    return resolveUrl(candidate);
  };

  // === Cargar lote del reporte usando /api/lotes (sin credenciales) y matcheando por ID ===
  const cargarLoteDeReporte = async (reporte) => {
    if (!reporte) {
      setLoteSel(null);
      return;
    }
    try {
      setCargandoLote(true);
      const { data } = await axios.get(`${API}/lotes/`); // sin headers
      const idReporteLote = Number(reporte?.lote?.id ?? reporte?.lote);
      const lote = data.find((l) => Number(l.id) === idReporteLote) || null;
      setLoteSel(lote);
    } catch (e) {
      console.error("Error al obtener el lote del reporte:", e);
      setLoteSel(null);
    } finally {
      setCargandoLote(false);
    }
  };

  // =================== FETCHS INICIALES ===================
  // carga usuario logueado, reportes, y usuarios para filtrar
  useEffect(() => {
    axios
      .get(`${API}/usuarios/me/`, { headers })
      .then((res) => setRol(res.data.rol))
      .catch((err) => console.error(err));

    axios
      .get(`${API}/reportes/`, { headers })
      .then((res) => setReportes(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`${API}/usuarios/`, { headers })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error(err));
  }, []);

  // filtra los campos en base al usuario seleccionado
  useEffect(() => {
    if (rol === "admin" && usuarioSeleccionado) {
      axios
        .get(`${API}/campos/?usuario=${usuarioSeleccionado}`, { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    } else if (rol !== "admin") {
      axios
        .get(`${API}/campos/`, { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    }
    setCampoSeleccionado("");
    setLoteSeleccionado("");
    setLotes([]);
  }, [usuarioSeleccionado, rol]);

  // carga lotes en el formulario de nuevo reporte.
  useEffect(() => {
    if (nuevoReporte.campo) {
      axios
        .get(`${API}/lotes/por-campo/${nuevoReporte.campo}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
      console.log(lotes);
    } else {
      setLotes([]);
    }
  }, [nuevoReporte.campo]);

  // carga lotes cuando usás los filtros de búsqueda.
  useEffect(() => {
    if (campoSeleccionado) {
      axios
        .get(`${API}/lotes/por-campo/${campoSeleccionado}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
      setLoteSeleccionado("");
    }
  }, [campoSeleccionado]);

  // =================== ACCIONES ===================
  const handleCrearReporte = () => {
    const formData = new FormData();
    Object.entries(nuevoReporte).forEach(([key, value]) => formData.append(key, value));

    axios
      .post(`${API}/reportes/`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setReportes((prev) => [...prev, res.data]);
        setShowModal(false);
        setNuevoReporte({
          productor: "",
          campo: "",
          lote: "",
          nombre: "",
          tipo_reporte: "",
          observaciones: "",
          archivo_pdf: null,
          fecha_reporte: "",
        });
      })
      .catch((err) => console.error(err));
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
      axios
        .delete(`${API}/reportes/${id}/`, { headers })
        .then(() => {
          setReportes((prev) => prev.filter((r) => r.id !== id));
          if (reporteSel?.id === id) {
            setReporteSel(null);
            setLoteSel(null);
            setPins([]);
          }
        })
        .catch((err) => {
          console.error("Error al eliminar el reporte:", err);
          alert("Hubo un error al eliminar el reporte.");
        });
    }
  };

  // =================== FILTROS ===================
  const reportesFiltrados = reportes.filter((r) => {
    const filtroBase =
      (!usuarioSeleccionado || r.productor === parseInt(usuarioSeleccionado)) &&
      (!campoSeleccionado || r.campo === parseInt(campoSeleccionado)) &&
      (!loteSeleccionado || r.lote === parseInt(loteSeleccionado));

    const valor = valorBusqueda.toLowerCase();
    if (!valor) return filtroBase;

    if (atributoFiltro === "nombre") return filtroBase && r.nombre.toLowerCase().includes(valor);
    if (atributoFiltro === "tipo_reporte") return filtroBase && r.tipo_reporte.toLowerCase().includes(valor);
    if (atributoFiltro === "productor") {
      const usuario = usuarios.find((u) => u.id === r.productor);
      return filtroBase && usuario?.email?.toLowerCase().includes(valor);
    }
    if (atributoFiltro === "campo") {
      const campo = campos.find((c) => c.id === r.campo);
      return filtroBase && campo?.nombre?.toLowerCase().includes(valor);
    }
    if (atributoFiltro === "fecha") {
      const fecha = new Date(r.fecha_reporte).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return filtroBase && fecha.toLowerCase().includes(valor);
    }
    return filtroBase;
  });

  const obtenerNombreCampo = (id) => campos.find((c) => c.id === id)?.nombre || id;
  const obtenerNombreLote = (id) => lotes.find((l) => l.id === id)?.nombre || id;
  const obtenerNombreUsuario = (id) => usuarios.find((u) => u.id === id)?.email || id;

  const opcionesUsuarios = usuarios.map((u) => ({ value: u.id, label: u.email }));
  const opcionesCampos = campos.map((c) => ({ value: c.id, label: c.nombre }));
  const opcionesLotes = lotes.map((l) => ({ value: l.id, label: l.nombre }));
  const opcionesFiltro = [
    { value: "nombre", label: "Nombre reporte" },
    { value: "tipo_reporte", label: "Tipo de reporte" },
    { value: "productor", label: "Usuario" },
    { value: "campo", label: "Campo" },
    { value: "fecha", label: "Fecha" },
  ];

  const customStyles = {
    control: (p, s) => ({
      ...p,
      borderColor: s.isFocused ? "#28a745" : "#ced4da",
      boxShadow: s.isFocused ? "0 0 0 1px #28a745" : "none",
      "&:hover": { borderColor: "#28a745" },
    }),
    option: (p, s) => ({
      ...p,
      backgroundColor: s.isSelected ? "#d4edda" : s.isFocused ? "#e9f7ef" : null,
      color: "#000",
    }),
    singleValue: (p) => ({ ...p, color: "#28a745" }),
  };

  // ============ PINS (conexión backend) ============
  // shape local: { id, x, y, color, text, serverId }
  const [pins, setPins] = useState([]);
  const [placingMode, setPlacingMode] = useState(false);
  const [pendingPos, setPendingPos] = useState(null);
  const [hoveredPinId, setHoveredPinId] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinDraft, setPinDraft] = useState({ text: "", color: "#e74c3c" });

  const pinColors = [
    { value: "#e74c3c", label: "Rojo (alerta)" },
    { value: "#f1c40f", label: "Amarillo (atención)" },
    { value: "#2ecc71", label: "Verde (ok)" },
  ];

  // click relativo dentro del contenedor (en %)
  const getRelativeClick = (evt) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const xPct = ((evt.clientX - rect.left) / rect.width) * 100;
    const yPct = ((evt.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, xPct)), y: Math.max(0, Math.min(100, yPct)) };
  };

  // ---- API de anotaciones ----
  const fetchAnotaciones = async (reporteId) => {
    try {
      const { data } = await axios.get(`${API}/reportes/${reporteId}/anotaciones/`, { headers });
      const mapped = data.map((a) => ({
        id: a.id,            // usamos el id del server para identificar
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

  const createAnotacion = async (reporteId, { x, y, color, text }) => {
    const payload = {
      reporte: reporteId,
      x_pct: Number(x.toFixed(2)),
      y_pct: Number(y.toFixed(2)),
      color,
      texto: text,
    };
    const { data } = await axios.post(`${API}/reportes/${reporteId}/anotaciones/`, payload, { headers });
    return {
      id: data.id,
      serverId: data.id,
      x: parseFloat(data.x_pct),
      y: parseFloat(data.y_pct),
      color: data.color,
      text: data.texto,
    };
  };

  const deleteAnotacion = async (reporteId, anotacionId) => {
    await axios.delete(`${API}/reportes/${reporteId}/anotaciones/${anotacionId}/`, { headers });
  };

  // al seleccionar reporte: cargar lote + anotaciones
  useEffect(() => {
    if (!reporteSel) {
      setPins([]);
      return;
    }
    setPlacingMode(false);
    setPendingPos(null);
    fetchAnotaciones(reporteSel.id);
  }, [reporteSel]);

  // ícono pin (solo icono)
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
    <div className="reportes-container">
      <h2 className="text-3xl font-bold mb-4">Reportes</h2>

      {rol === "admin" && (
        <div className="mb-4">
          <button className="btn btn-success" onClick={() => setShowModal(true)}>
            Agregar nuevo reporte
          </button>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-3" style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
        <div style={{ width: "180px" }}>
          <Select
            options={opcionesFiltro}
            value={opcionesFiltro.find((opt) => opt.value === atributoFiltro)}
            onChange={(opcion) => setAtributoFiltro(opcion.value)}
            styles={customStyles}
            isSearchable={false}
          />
        </div>

        <input
          type="text"
          placeholder={`Buscar por ${atributoFiltro}`}
          value={valorBusqueda}
          onChange={(e) => setValorBusqueda(e.target.value)}
          style={{
            height: "38px",
            borderRadius: "6px",
            border: "1px solid #ced4da",
            backgroundColor: "#fff",
            padding: "0 12px",
            fontSize: "14px",
            color: "#333",
            boxShadow: "none",
            width: "450px",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={() => {
            setValorBusqueda("");
            setAtributoFiltro("nombre");
          }}
          style={{
            height: "38px",
            padding: "0 16px",
            fontSize: "14px",
            border: "1px solid #ced4da",
            borderRadius: "6px",
            backgroundColor: "#fff",
            color: "#333",
          }}
        >
          Limpiar
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros">
        {rol === "admin" && (
          <div className="filtro" style={{ minWidth: "250px" }}>
            <label>Usuario:</label>
            <Select
              options={[{ value: "", label: "Todos" }, ...opcionesUsuarios]}
              value={opcionesUsuarios.find((o) => o.value === usuarioSeleccionado) || { value: "", label: "Todos" }}
              onChange={(opcion) => setUsuarioSeleccionado(opcion.value)}
              placeholder="Buscar usuario..."
              isSearchable
              styles={customStyles}
            />
          </div>
        )}

        <div className="filtro">
          <label>Campo:</label>
          <Select
            options={[{ value: "", label: "Todos" }, ...opcionesCampos]}
            value={
              opcionesCampos.find((o) => o.value === campoSeleccionado) || {
                value: "",
                label: "Todos",
              }
            }
            onChange={(opcion) => setCampoSeleccionado(opcion.value)}
            placeholder="Buscar campo..."
            isSearchable
            isDisabled={rol === "admin" && !usuarioSeleccionado}
            styles={customStyles}
          />
        </div>

        <div className="filtro">
          <label>Lote:</label>
          <Select
            options={[{ value: "", label: "Todos" }, ...opcionesLotes]}
            value={
              opcionesLotes.find((o) => o.value === loteSeleccionado) || {
                value: "",
                label: "Todos",
              }
            }
            onChange={(opcion) => setLoteSeleccionado(opcion.value)}
            placeholder="Buscar lote..."
            isSearchable
            isDisabled={!campoSeleccionado}
            styles={customStyles}
          />
        </div>
      </div>

      {/* Layout 2 columnas */}
      <div className="reportes-layout">
        {/* Columna izquierda: tarjetas */}
        <div className="reportes-col">
          <div className="lista-reportes">
            {reportesFiltrados.length === 0 && <div className="reporte-card empty">No hay reportes con ese filtro.</div>}

            {reportesFiltrados.map((r) => {
              const fechaObj = new Date(r.fecha_reporte);
              const dia = fechaObj.getDate().toString().padStart(2, "0");
              const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
              const mes = meses[fechaObj.getMonth()];
              const anio2 = fechaObj.getFullYear().toString().slice(-2);
              const cabecera = `${dia} ${mes} ${anio2} - ${r.campo_nombre || obtenerNombreCampo(r.campo)
                } - ${r.lote_nombre || obtenerNombreLote(r.lote)
                } - ${r.nombre}`;

              const isSel = reporteSel?.id === r.id;

              return (
                <div
                  key={r.id}
                  className={`reporte-card ${isSel ? "selected" : ""}`}
                  onClick={() => {
                    setReporteSel(r);
                    cargarLoteDeReporte(r);
                  }}
                  role="button"
                >
                  <div className="reporte-top">
                    <span className="reporte-titulo">{cabecera}</span>
                    {rol === "admin" && (
                      <div className="reporte-actions" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-outline-primary btn-sm" title="Editar">
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Eliminar"
                          onClick={() => handleEliminar(r.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="reporte-body">
                    <div className="reporte-meta">
                      <span className="chip">Tipo: {r.tipo_reporte}</span>
                      {r.observaciones && <span className="chip">Obs: {r.observaciones}</span>}
                      {rol === "admin" && <span className="chip">Usuario: {obtenerNombreUsuario(r.productor)}</span>}
                    </div>

                    <a
                      href={r.archivo_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-light ver-pdf"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                      Ver Reporte
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna derecha: Registros */}
        <aside className="registros-col">
          <div className="registros-card">
            <div className="registros-header">Registros</div>
            <div className="registros-body">
              {!reporteSel && <div className="registros-placeholder">Seleccioná un reporte para ver sus registros.</div>}

              {reporteSel && (
                <>
                  {/* CABECERA + BOTONES */}
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
                        className="btn btn-sm btn-success me-2"
                        onClick={() => {
                          setPlacingMode(true);
                          setPendingPos(null);
                          setPinDraft({ text: "", color: pinColors[0].value });
                        }}
                      >
                        Agregar anotación
                      </button>

                      <button type="button" className="btn btn-sm btn-outline-success" onClick={() => setShowRegModal(true)}>
                        Expandir
                      </button>
                    </div>
                  </div>

                  {/* IMAGEN */}
                  <div className="registros-imgWrap">
                    {cargandoLote ? (
                      <div className="registros-loading">Cargando imagen del lote…</div>
                    ) : getLoteImage(loteSel) ? (
                      <div
                        className={`pins-canvas ${placingMode ? "is-placing" : ""}`}
                        onClick={(e) => {
                          if (!placingMode) return;
                          const pos = getRelativeClick(e);
                          setPendingPos(pos);
                          setShowPinModal(true);
                          setPlacingMode(false);
                        }}
                      >
                        <img src={getLoteImage(loteSel)} alt="Mapa/imagen del lote" className="registros-img" />

                        {/* Pines */}
                        {pins.map((p) => (
                          <div
                            key={p.id}
                            className={`pin ${hoveredPinId === p.id ? "is-hovered" : ""}`}
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                            onMouseEnter={() => setHoveredPinId(p.id)}
                            onMouseLeave={() => setHoveredPinId(null)}
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

                  {/* AVISO debajo de la imagen */}
                  {placingMode && <div className="placing-hint under">Hacé click en la imagen para ubicar el pin…</div>}

                  {/* Lista de comentarios */}
                  <div className="comentarios-list">
                    {pins.length === 0 ? (
                      <div className="comentario-empty">Sin anotaciones aún.</div>
                    ) : (
                      pins.map((p) => (
                        <div
                          key={p.id}
                          className={`comentario-row ${hoveredPinId === p.id ? "is-hovered" : ""}`}
                          style={{ "--pinColor": p.color }}
                          onMouseEnter={() => setHoveredPinId(p.id)}
                          onMouseLeave={() => setHoveredPinId(null)}
                        >
                          <span className="comentario-dot" style={{ background: p.color }} />
                          <span className="comentario-text">{p.text}</span>
                          <button
                            className="comentario-del"
                            onClick={async () => {
                              try {
                                if (p.serverId) await deleteAnotacion(reporteSel.id, p.serverId);
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
      </div>

      {/* Modal de creación de PIN */}
      <Modal show={showPinModal} onHide={() => { setShowPinModal(false); setPendingPos(null); }} centered>
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
              placeholder="Ej: zona de plagas"
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
                  className="color-pill"
                  style={{
                    background: c.value,
                    outline: pinDraft.color === c.value ? "3px solid rgba(0,0,0,0.15)" : "none",
                  }}
                  onClick={() => setPinDraft({ ...pinDraft, color: c.value })}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowPinModal(false); setPendingPos(null); }}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                if (!pinDraft.text.trim() || !pendingPos || !reporteSel?.id) return;

                // persistir en backend
                const created = await createAnotacion(reporteSel.id, {
                  x: pendingPos.x,
                  y: pendingPos.y,
                  color: pinDraft.color,
                  text: pinDraft.text.trim(),
                });

                // reflejar en UI
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

      {/* Modal de creación de reporte */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Reporte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                as="select"
                value={nuevoReporte.productor}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, productor: e.target.value })}
              >
                <option value="">Seleccione</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Campo</Form.Label>
              <Form.Control
                as="select"
                value={nuevoReporte.campo}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, campo: e.target.value })}
              >
                <option value="">Seleccione</option>
                {campos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Lote</Form.Label>
              <Form.Control
                as="select"
                value={nuevoReporte.lote}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, lote: e.target.value })}
              >
                <option value="">Seleccione</option>
                {lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={nuevoReporte.nombre}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Tipo de Reporte</Form.Label>
              <Form.Control
                type="text"
                value={nuevoReporte.tipo_reporte}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, tipo_reporte: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Fecha del Reporte</Form.Label>
              <Form.Control
                type="datetime-local"
                value={nuevoReporte.fecha_reporte}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, fecha_reporte: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={nuevoReporte.observaciones}
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, observaciones: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Archivo PDF</Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={(e) => setNuevoReporte({ ...nuevoReporte, archivo_pdf: e.target.files[0] })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCrearReporte}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal expandir */}
      <Modal show={showRegModal} onHide={() => setShowRegModal(false)} size="xl" centered dialogClassName="registros-modal">
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
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    setPlacingMode(true);
                    setPendingPos(null);
                    setPinDraft({ text: "", color: pinColors[0].value });
                  }}
                >
                  Agregar anotación
                </button>
              </div>

              <div className="registros-imgWrap">
                {cargandoLote ? (
                  <div className="registros-loading">Cargando imagen del lote…</div>
                ) : getLoteImage(loteSel) ? (
                  <div
                    className={`pins-canvas ${placingMode ? "is-placing" : ""}`}
                    onClick={(e) => {
                      if (!placingMode) return;
                      const pos = getRelativeClick(e);
                      setPendingPos(pos);
                      setShowPinModal(true);
                      setPlacingMode(false);
                    }}
                  >
                    <img src={getLoteImage(loteSel)} alt="Mapa/imagen del lote" className="registros-img registros-img--lg" />

                    {pins.map((p) => (
                      <div
                        key={p.id}
                        className={`pin ${hoveredPinId === p.id ? "is-hovered" : ""}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        onMouseEnter={() => setHoveredPinId(p.id)}
                        onMouseLeave={() => setHoveredPinId(null)}
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

              {placingMode && <div className="placing-hint under">Hacé click en la imagen para ubicar el pin…</div>}

              {/* Lista de comentarios */}
              <div className="comentarios-list">
                {pins.length === 0 ? (
                  <div className="comentario-empty">Sin anotaciones aún.</div>
                ) : (
                  pins.map((p) => (
                    <div
                      key={`row-${p.id}`}
                      className={`comentario-row ${hoveredPinId === p.id ? "is-hovered" : ""}`}
                      style={{ "--pinColor": p.color }}
                      onMouseEnter={() => setHoveredPinId(p.id)}
                      onMouseLeave={() => setHoveredPinId(null)}
                    >
                      <span className="comentario-dot" style={{ background: p.color }} />
                      <span className="comentario-text">{p.text}</span>
                      <button
                        className="comentario-del"
                        title="Eliminar"
                        onClick={async () => {
                          try {
                            if (p.serverId) await deleteAnotacion(reporteSel.id, p.serverId);
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
    </div>
  );
};

export default Reportes;
