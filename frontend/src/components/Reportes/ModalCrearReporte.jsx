import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalCrearReporte = ({
  show,
  onClose,
  onCrear,
  // form state
  nuevoReporte,
  setNuevoReporte,
  // data
  usuarios,
  campos,
  lotes,
}) => {
  return (
    <Modal show={show} onHide={onClose}>
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
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button className={`btn btn-success `} onClick={onCrear}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCrearReporte;

