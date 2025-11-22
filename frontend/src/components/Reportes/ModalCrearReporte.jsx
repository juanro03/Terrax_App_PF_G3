import React, { useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalCrearReporte = ({
  show,
  onClose,
  onCrear,
  nuevoReporte,
  setNuevoReporte,
  usuarios,
  campos,
  lotes,
}) => {

  // === CAMPOS filtrados por PROPIETARIO ===
  const camposFiltrados = useMemo(() => {
    if (!nuevoReporte.productor) return [];
    return campos.filter(
      (c) => String(c.propietario) === String(nuevoReporte.productor)
    );
  }, [campos, nuevoReporte.productor]);

  // === LOTES filtrados por campo seleccionado ===
  const lotesFiltrados = useMemo(() => {
    if (!nuevoReporte.campo) return [];
    return lotes.filter(
      (l) => String(l.campo) === String(nuevoReporte.campo)
    );
  }, [lotes, nuevoReporte.campo]);


  // === EVENTOS ===
  const handleSelectUsuario = (e) => {
    const productor = e.target.value;
    setNuevoReporte({
      ...nuevoReporte,
      productor,
      campo: "",
      lote: "",
    });
  };

  const handleSelectCampo = (e) => {
    const campo = e.target.value;
    setNuevoReporte({
      ...nuevoReporte,
      campo,
      lote: "",
    });
  };


  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Reporte</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>

          {/* USUARIO */}
          <Form.Group>
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              as="select"
              value={nuevoReporte.productor}
              onChange={handleSelectUsuario}
            >
              <option value="">Seleccione</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* CAMPO */}
          <Form.Group>
            <Form.Label>Campo</Form.Label>
            <Form.Control
              as="select"
              value={nuevoReporte.campo}
              onChange={handleSelectCampo}
              disabled={!nuevoReporte.productor}
            >
              <option value="">Seleccione</option>
              {camposFiltrados.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* LOTE */}
          <Form.Group>
            <Form.Label>Lote</Form.Label>
            <Form.Control
              as="select"
              value={nuevoReporte.lote}
              onChange={(e) =>
                setNuevoReporte({ ...nuevoReporte, lote: e.target.value })
              }
              disabled={!nuevoReporte.campo}
            >
              <option value="">Seleccione</option>
              {lotesFiltrados.map((l) => (
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
              onChange={(e) =>
                setNuevoReporte({ ...nuevoReporte, nombre: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Tipo de Reporte</Form.Label>
            <Form.Control
              type="text"
              value={nuevoReporte.tipo_reporte}
              onChange={(e) =>
                setNuevoReporte({ ...nuevoReporte, tipo_reporte: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="datetime-local"
              value={nuevoReporte.fecha_reporte}
              onChange={(e) =>
                setNuevoReporte({ ...nuevoReporte, fecha_reporte: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={nuevoReporte.observaciones}
              onChange={(e) =>
                setNuevoReporte({ ...nuevoReporte, observaciones: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Archivo PDF</Form.Label>
            <Form.Control
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setNuevoReporte({
                  ...nuevoReporte,
                  archivo_pdf: e.target.files[0],
                })
              }
            />
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="btn btn-success" onClick={onCrear}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCrearReporte;
