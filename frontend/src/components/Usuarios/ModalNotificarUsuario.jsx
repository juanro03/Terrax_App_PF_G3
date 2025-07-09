// ModalNotificarUsuario.jsx
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";

const ModalNotificarUsuario = ({ show, onHide, usuarioId }) => {
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      await axios.post("/api/notificar/", { user_id: usuarioId });
      alert("Notificación enviada con éxito");
      onHide();
    } catch (error) {
      alert("Error al enviar la notificación");
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Enviar notificación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="tipoNotificacion">
          <Form.Label>Tipo de notificación</Form.Label>
          <Form.Control as="select" disabled>
            <option value="email">Correo electrónico</option>
          </Form.Control>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={enviando}>
          Cancelar
        </Button>
        <Button variant="success" onClick={handleEnviar} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNotificarUsuario;
