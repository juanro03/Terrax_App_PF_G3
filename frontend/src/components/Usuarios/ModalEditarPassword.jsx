import React, { useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import "./Usuarios.css";

const ModalEditarPassword = ({ show, onHide, usuarioId, onSuccess }) => {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:8000/api/usuarios/${usuarioId}/cambiar-password/`,
        { actual, nueva },
        { headers: { "Content-Type": "application/json" } }
      );
      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      alert("No se pudo cambiar la contraseña. Verifique la actual.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cambiar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Contraseña Actual</Form.Label>
            <Form.Control
              type="password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Nueva Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              required
            />
          </Form.Group>
          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cambiar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarPassword;
