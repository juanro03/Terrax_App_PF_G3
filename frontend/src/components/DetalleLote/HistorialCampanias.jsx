import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { FaArrowLeft, FaDownload, FaFileAlt } from "react-icons/fa";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import "./HistorialCampanias.css";

const BASE = "http://127.0.0.1:8000/api";
const url = (p) => `${BASE}${p}`;

const format = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "—");

// Para compatibilidad con keys alternativas en cobertura
const covFrom = (c) => ({
  fecha: c.fecha_cobertura ?? c.cobertura_fecha ?? null,
  cultivo: c.cultivo_cobertura ?? c.cobertura_cultivo ?? null,
  variedad: c.variedad_cobertura ?? c.cobertura_variedad ?? null,
  densidad: c.densidad_cobertura ?? c.cobertura_densidad ?? null,
});

const GridSectionTitle = ({ children }) => (
  <h6
    className="mt-0 mb-3"
    style={{ gridColumn: "1 / -1", fontSize: "18px", fontWeight: 600, color: "#000" }}
  >
    {children}
  </h6>
);

const CampaignCard = ({ c, onEdit, onDelete }) => {
  const cov = covFrom(c);
  const hasCov = !!(cov.fecha || cov.cultivo || cov.variedad || cov.densidad);

  return (
    <div className="camp-card">
      <div className="camp-card__dot" />
      <div className="camp-card__content">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">
            Campaña - {format(c.fecha_siembra)} - {format(c.fecha_cosecha)}
          </h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success btn-sm rounded-circle"
              style={{ width: 34, height: 34, borderWidth: 2 }}
              onClick={() => onEdit?.(c)}
              title="Editar campaña"
            >
              <i className="bi bi-pencil" />
            </button>
            <button
              className="btn btn-outline-danger btn-sm rounded-circle"
              style={{ width: 34, height: 34, borderWidth: 2 }}
              onClick={() => onDelete?.(c)}
              title="Eliminar campaña"
            >
              <i className="bi bi-trash" />
            </button>
          </div>
        </div>


        <hr className="camp-divider" />

        {/* Body */}
        <div className="camp-card__grid">
          <GridSectionTitle>Siembra</GridSectionTitle>
          <div>
            <div className="label">Densidad:</div>
            <div className="value">
              {c.densidad} {c.unidad_densidad || ""}
            </div>
          </div>
          <div>
            <div className="label">Ventana estimada cosecha:</div>
            <div className="value">{format(c.ventana_cosecha)}</div>
          </div>

          <hr className="camp-divider" />
          <hr className="camp-divider" />

          <GridSectionTitle>Cosecha</GridSectionTitle>
          <div>
            <div className="label">Fecha de cosecha:</div>
            <div className="value">{format(c.fecha_cosecha)}</div>
          </div>
          <div>
            <div className="label">Rinde:</div>
            <div className="value">{c.rinde || "—"}</div>
          </div>

          {hasCov && (
            <>
              <hr className="camp-divider" />
              <hr className="camp-divider" />
              <GridSectionTitle>Cobertura</GridSectionTitle>
              <div>
                <div className="label">Cultivo:</div>
                <div className="value">{cov.cultivo || "—"}</div>
              </div>
              <div>
                <div className="label">Variedad:</div>
                <div className="value">{cov.variedad || "—"}</div>
              </div>
              <div>
                <div className="label">Fecha:</div>
                <div className="value">{format(cov.fecha)}</div>
              </div>
              <div>
                <div className="label">Densidad:</div>
                <div className="value">{cov.densidad || "—"}</div>
              </div>
            </>
          )}
        </div>

        {(c.analisis_suelo || c.archivo_rendimiento) && (
          <div className="camp-card__files">
            {c.analisis_suelo && (
              <a className="file-chip" href={c.analisis_suelo} target="_blank" rel="noreferrer">
                <FaFileAlt className="me-2" /> Análisis de suelo
              </a>
            )}
            {c.archivo_rendimiento && (
              <a className="file-chip" href={c.archivo_rendimiento} target="_blank" rel="noreferrer">
                <FaDownload className="me-2" /> Archivo de rendimiento
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const HistorialCampanias = ({ embedded = false, loteId: loteIdProp, campoInfoProp, loteNombreProp }) => {
  const { loteId: loteIdFromUrl } = useParams();
  const loteId = loteIdProp ?? loteIdFromUrl;

  const navigate = useNavigate();
  const location = useLocation();

  const [campanias, setCampanias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editar / eliminar
  const [editOpen, setEditOpen] = useState(false);
  const [editCamp, setEditCamp] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Breadcrumb data (solo cuando NO está embebido)
  const campoId = embedded ? (campoInfoProp?.id ?? null) : (location.state?.campoId ?? null);
  const campoNombre = embedded ? (campoInfoProp?.nombre ?? "Campo") : (location.state?.campoNombre ?? "Campo");
  const loteNombre = embedded ? (loteNombreProp ?? `Lote ${loteId}`) : (location.state?.loteNombre ?? `Lote ${loteId}`);

  // Filtros
  const [qAnio, setQAnio] = useState("");

  const fetchCampanias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(url(`/campanias/por-lote/${loteId}/`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCampanias(data || []);
    } catch (e) {
      console.error("Error obteniendo historial de campañas:", e?.response?.data || e.message);
      setCampanias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loteId) return;
    fetchCampanias();
  }, [loteId]);

  const campaniasFiltradas = useMemo(() => {
    return (campanias || []).filter((c) => {
      const okAnio = qAnio ? dayjs(c.fecha_siembra).year() === Number(qAnio) : true;
      return okAnio;
    });
  }, [campanias, qAnio]);

  const aniosDisponibles = useMemo(() => {
    const set = new Set(
      (campanias || [])
        .map((c) => dayjs(c.fecha_siembra).year())
        .filter((y) => !isNaN(y))
    );
    return Array.from(set).sort((a, b) => b - a);
  }, [campanias]);

  // Editar
  const handleEdit = (campania) => {
    setEditCamp(campania);
    setEditForm({
      cultivo: campania.cultivo || "",
      variedad: campania.variedad || "",
      densidad: campania.densidad || "",
      unidad_densidad: campania.unidad_densidad || "Kg/Ha",
      ventana_cosecha: campania.ventana_cosecha || "",
      fecha_siembra: campania.fecha_siembra || "",
      fecha_cosecha: campania.fecha_cosecha || "",
      rinde: campania.rinde || "",

      fecha_cobertura: campania.fecha_cobertura || "",
      cultivo_cobertura: campania.cultivo_cobertura || "",
      variedad_cobertura: campania.variedad_cobertura || "",
      densidad_cobertura: campania.densidad_cobertura || "",
      unidad_densidad_cobertura: campania.unidad_densidad_cobertura || "Kg/Ha",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editCamp) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      for (const key in editForm) {
        if (editForm[key] !== null && editForm[key] !== undefined)
          formData.append(key, editForm[key]);
      }
      const { data } = await axios.patch(url(`/campanias/${editCamp.id}/`), formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });
      setCampanias((prev) => prev.map((c) => (c.id === editCamp.id ? data : c)));
      setEditOpen(false);
    } catch (err) {
      console.error("Error al editar campaña:", err);
      alert("No se pudo guardar la campaña.");
    } finally {
      setSaving(false);
    }
  };

  // Eliminar
  const handleDelete = (campania) => setConfirmDelete(campania);

  const confirmDeleteCampania = async () => {
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(url(`/campanias/${confirmDelete.id}/`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Optimista
      setCampanias((prev) => prev.filter((c) => String(c.id) !== String(confirmDelete.id)));
      // Refresco real
      await fetchCampanias();
    } catch (err) {
      console.error("Error al eliminar campaña:", err?.response?.data || err.message);
      alert("No se pudo eliminar la campaña.");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f0fdf4" }}>
      {/* Header/breadcrumb solo si NO está embebido */}
      {!embedded && (
        <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
          <button
            type="button"
            className="btn btn-outline-success btn-sm d-inline-flex align-items-center"
            onClick={() => {
              if (campoId) navigate(`/campos/${campoId}/lotes`);
              else navigate(-1);
            }}
          >
            <FaArrowLeft className="me-2" />
            Volver
          </button>

          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><Link to="/campos">Campos</Link></li>
              <li className="breadcrumb-item">
                {campoId ? (
                  <Link to={`/campos/${campoId}/lotes`}>{campoNombre}</Link>
                ) : (
                  <span>{campoNombre}</span>
                )}
              </li>
              <li className="breadcrumb-item">
                <Link to={`/lotes/${loteId}`}>{loteNombre}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Historial</li>
            </ol>
          </nav>
        </div>
      )}

      {/* Modal Editar (3 columnas simétricas) */}
      <Modal show={editOpen} onHide={() => setEditOpen(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar campaña</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!editCamp ? null : (
            <>
              {editForm.errorMsg && (
                <div className="alert alert-danger py-2 mb-3 text-center">
                  {editForm.errorMsg}
                </div>
              )}

              <Row className="g-4">
                {/* Columna 1: Siembra */}
                <Col md={4}>
                  <h6 className="fw-bold mb-3">Siembra</h6>

                  <Form.Label>Fecha de siembra *</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.fecha_siembra || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, fecha_siembra: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Cultivo *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.cultivo || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, cultivo: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Variedad *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.variedad || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, variedad: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Densidad *</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.densidad || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, densidad: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Unidad de densidad *</Form.Label>
                  <Form.Select
                    value={editForm.unidad_densidad || "Kg/Ha"}
                    onChange={(e) => setEditForm((p) => ({ ...p, unidad_densidad: e.target.value }))}
                  >
                    <option value="Kg/Ha">Kg/Ha</option>
                    <option value="Pl/Ha">Pl/Ha</option>
                  </Form.Select>

                  <Form.Label className="mt-3">Ventana estimada de cosecha *</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.ventana_cosecha || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, ventana_cosecha: e.target.value }))}
                  />
                </Col>

                {/* Columna 2: Cosecha */}
                <Col md={4}>
                  <h6 className="fw-bold mb-3">Cosecha</h6>

                  <Form.Label>Fecha de cosecha *</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.fecha_cosecha || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, fecha_cosecha: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Rinde *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.rinde || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, rinde: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Archivo de rendimiento</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setEditForm((p) => ({ ...p, archivo_rendimiento: e.target.files[0] }))}
                  />

                  <Form.Label className="mt-3">Análisis de suelo</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setEditForm((p) => ({ ...p, analisis_suelo: e.target.files[0] }))}
                  />
                </Col>

                {/* Columna 3: Cobertura (opcional) */}
                <Col md={4}>
                  <h6 className="fw-bold mb-3">Cobertura (opcional)</h6>

                  <Form.Label>Fecha de cobertura</Form.Label>
                  <Form.Control
                    type="date"
                    value={editForm.fecha_cobertura || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, fecha_cobertura: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Cultivo</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.cultivo_cobertura || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, cultivo_cobertura: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Variedad</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.variedad_cobertura || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, variedad_cobertura: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Densidad</Form.Label>
                  <Form.Control
                    type="number"
                    value={editForm.densidad_cobertura || ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, densidad_cobertura: e.target.value }))}
                  />

                  <Form.Label className="mt-3">Unidad de densidad</Form.Label>
                  <Form.Select
                    value={editForm.unidad_densidad_cobertura || "Kg/Ha"}
                    onChange={(e) => setEditForm((p) => ({ ...p, unidad_densidad_cobertura: e.target.value }))}
                  >
                    <option value="Kg/Ha">Kg/Ha</option>
                    <option value="Pl/Ha">Pl/Ha</option>
                  </Form.Select>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={async () => {
              // Validación de obligatorios (siembra + cosecha)
              const obligatorios = [
                "fecha_siembra",
                "cultivo",
                "variedad",
                "densidad",
                "unidad_densidad",
                "ventana_cosecha",
                "fecha_cosecha",
                "rinde",
              ];
              const faltantes = obligatorios.filter((k) => !editForm[k] || editForm[k] === "");
              if (faltantes.length > 0) {
                setEditForm((p) => ({
                  ...p,
                  errorMsg: "Hay campos obligatorios de siembra o cosecha sin completar.",
                }));
                return;
              }

              // Validación: fecha de cosecha posterior a fecha de siembra
              const fechaC = new Date(editForm.fecha_cosecha);
              const fechaS = new Date(editForm.fecha_siembra);

              if (fechaC <= fechaS) {
                setEditForm((p) => ({
                  ...p,
                  errorMsg: "La cosecha debe ser posterior a la fecha de siembra.",
                }));
                return;
              }

              setEditForm((p) => ({ ...p, errorMsg: null }));
              await saveEdit();
            }}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmación Eliminar */}
      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-card p-4">
            <h5 className="fw-bold mb-2">¿Seguro que desea eliminar la campaña?</h5>
            <p className="mb-2">Esta acción es irreversible y eliminará el registro permanentemente.</p>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteCampania}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="timeline-container">

        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">Historial de Campañas</h5>
          <div>
            <select
              className="form-select"
              style={{ width: 170 }}
              value={qAnio}
              onChange={(e) => setQAnio(e.target.value)}
            >
              <option value="">Todos los años</option>
              {aniosDisponibles.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="timeline-wrap">
          {loading ? (
            <div className="text-center py-5">Cargando historial…</div>
          ) : campaniasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Sin campañas registradas</div>
              <p className="empty-text">
                Cuando finalices campañas desde <strong>Detalle del Lote</strong>, las verás listadas aquí.
              </p>
            </div>
          ) : (
            campaniasFiltradas.map((c) => (
              <CampaignCard key={c.id} c={c} onEdit={handleEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialCampanias;
