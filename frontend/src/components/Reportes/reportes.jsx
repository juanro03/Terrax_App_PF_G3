import React, { useEffect, useState } from "react";
import axios from "axios";
import "./reportes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";

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

  // Prioriza imagen_satelital y si no hay, usa imagen_dron (según tu modelo)
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
      const { data } = await axios.get("http://127.0.0.1:8000/api/lotes/"); // sin headers
      // reporte.lote puede ser un id o un objeto; cubrimos ambos casos
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
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/usuarios/me/", { headers })
      .then((res) => setRol(res.data.rol))
      .catch((err) => console.error(err));

    axios
      .get("http://127.0.0.1:8000/api/reportes/", { headers })
      .then((res) => setReportes(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://127.0.0.1:8000/api/usuarios/", { headers })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (rol === "admin" && usuarioSeleccionado) {
      axios
        .get(`http://127.0.0.1:8000/api/campos/?usuario=${usuarioSeleccionado}`, { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    } else if (rol !== "admin") {
      axios
        .get("http://127.0.0.1:8000/api/campos/", { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    }
    setCampoSeleccionado("");
    setLoteSeleccionado("");
    setLotes([]);
  }, [usuarioSeleccionado, rol]);

  useEffect(() => {
    if (nuevoReporte.campo) {
      axios
        .get(`http://127.0.0.1:8000/api/lotes/por-campo/${nuevoReporte.campo}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
    }
  }, [nuevoReporte.campo]);

  useEffect(() => {
    if (campoSeleccionado) {
      axios
        .get(`http://127.0.0.1:8000/api/lotes/por-campo/${campoSeleccionado}`, { headers })
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
      .post("http://127.0.0.1:8000/api/reportes/", formData, {
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
        .delete(`http://127.0.0.1:8000/api/reportes/${id}/`, { headers })
        .then(() => {
          setReportes((prev) => prev.filter((r) => r.id !== id));
          if (reporteSel?.id === id) {
            setReporteSel(null);
            setLoteSel(null);
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
            {reportesFiltrados.length === 0 && (
              <div className="reporte-card empty">No hay reportes con ese filtro.</div>
            )}

            {reportesFiltrados.map((r) => {
              const fechaObj = new Date(r.fecha_reporte);
              const dia = fechaObj.getDate().toString().padStart(2, "0");
              const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
              const mes = meses[fechaObj.getMonth()];
              const anio2 = fechaObj.getFullYear().toString().slice(-2);
              const cabecera = `${dia} ${mes} ${anio2} - ${obtenerNombreCampo(r.campo)} - ${obtenerNombreLote(
                r.lote
              )} - ${r.nombre}`;

              const isSel = reporteSel?.id === r.id;

              return (
                <div
                  key={r.id}
                  className={`reporte-card ${isSel ? "selected" : ""}`}
                  onClick={() => {
                    setReporteSel(r);
                    cargarLoteDeReporte(r); // << usa /api/lotes y matchea ID exacto
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
                      Ver PDF
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
              {!reporteSel && (
                <div className="registros-placeholder">Seleccioná un reporte para ver sus registros.</div>
              )}

              {reporteSel && (
                <>
                  <div className="registros-subhead">
                    <span className="bullet"></span>
                    {new Date(reporteSel.fecha_reporte).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}{" "}
                    — {reporteSel.nombre}
                  </div>

                  <div className="registros-imgWrap">
                    {cargandoLote ? (
                      <div className="registros-loading">Cargando imagen del lote…</div>
                    ) : getLoteImage(loteSel) ? (
                      <img src={getLoteImage(loteSel)} alt="Mapa/imagen del lote" className="registros-img" />
                    ) : (
                      <div className="registros-noimg">Sin imagen del lote</div>
                    )}
                  </div>

                  {reporteSel.observaciones && <div className="registro-bubble warn">{reporteSel.observaciones}</div>}

                  <input type="text" className="registro-input" placeholder="Añadir comentarios" disabled title="(Demo UI)" />
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de creación */}
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
    </div>
  );
};

export default Reportes;
