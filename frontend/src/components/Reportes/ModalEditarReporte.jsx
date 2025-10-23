import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";

const API = "http://127.0.0.1:8000/api";

const ModalEditarReporte = ({
  show,
  onClose,
  onUpdate,
  reporteAEditar,
  usuarios,
  campos,
}) => {
  const [datosEditados, setDatosEditados] = useState(reporteAEditar);
  const [lotes, setLotes] = useState([]);
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  // Cargar datos del reporte cuando se abre el modal
  useEffect(() => {
    if (reporteAEditar) {
      // Aseguramos que los campos relacionados sean solo IDs para el estado inicial
      setDatosEditados({
        ...reporteAEditar,
        productor: reporteAEditar.productor,
        campo: reporteAEditar.campo,
        lote: reporteAEditar.lote,
      });
    }
  }, [reporteAEditar]);

  // Cargar lotes cuando el campo cambia en el formulario de edición
  useEffect(() => {
    if (datosEditados?.campo) {
      axios
        .get(`${API}/lotes/por-campo/${datosEditados.campo}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => {
          console.error("Error al cargar lotes para edición:", err);
          setLotes([]);
        });
    } else {
      setLotes([]);
    }
  }, [datosEditados?.campo]);

  if (!show || !datosEditados) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosEditados((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDatosEditados((prev) => ({ ...prev, archivo_pdf: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(datosEditados);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Reporte</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Nombre del Reporte */}
          <Form.Group className="mb-3" controlId="edit-nombre">
            <Form.Label>Nombre del Reporte</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={datosEditados.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Productor (Usuario) */}
          <Form.Group className="mb-3" controlId="edit-productor">
            <Form.Label>Productor</Form.Label>
            <Form.Select
              name="productor"
              value={datosEditados.productor}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un productor</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Campo */}
          <Form.Group className="mb-3" controlId="edit-campo">
            <Form.Label>Campo</Form.Label>
            <Form.Select
              name="campo"
              value={datosEditados.campo}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un campo</option>
              {campos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Lote */}
          <Form.Group className="mb-3" controlId="edit-lote">
            <Form.Label>Lote</Form.Label>
            <Form.Select
              name="lote"
              value={datosEditados.lote}
              onChange={handleChange}
              disabled={!datosEditados.campo || lotes.length === 0}
              required
            >
              <option value="">Seleccione un lote</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Tipo de Reporte */}
          <Form.Group className="mb-3" controlId="edit-tipo_reporte">
            <Form.Label>Tipo de Reporte</Form.Label>
            <Form.Control
              type="text"
              name="tipo_reporte"
              value={datosEditados.tipo_reporte}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Observaciones */}
          <Form.Group className="mb-3" controlId="edit-observaciones">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="observaciones"
              value={datosEditados.observaciones}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Fecha */}
          <Form.Group className="mb-3" controlId="edit-fecha_reporte">
            <Form.Label>Fecha del Reporte</Form.Label>
            <Form.Control
              type="date"
              name="fecha_reporte"
              value={datosEditados.fecha_reporte}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Archivo PDF */}
          <Form.Group className="mb-3" controlId="edit-archivo_pdf">
            <Form.Label>
              Archivo PDF (opcional, solo si desea reemplazarlo)
            </Form.Label>
            <Form.Control
              type="file"
              name="archivo_pdf"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {typeof reporteAEditar.archivo_pdf === "string" && (
              <Form.Text className="d-block mt-1">
                Archivo actual:{" "}
                <a
                  href={reporteAEditar.archivo_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver PDF
                </a>
              </Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEditarReporte;
              