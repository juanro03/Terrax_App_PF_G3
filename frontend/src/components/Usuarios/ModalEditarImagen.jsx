import React, { useState } from "react";
import axios from "../../axiosconfig";
import { Modal, Button, Form } from "react-bootstrap";

const EditarImagen = ({ show, onHide, usuarioId, onSuccess }) => {
  const [imagen, setImagen] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("imagen_perfil", imagen);

    try {
      await axios.patch(`http://localhost:8000/api/usuarios/${usuarioId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error al actualizar imagen de perfil:", error);
      alert("No se pudo actualizar la imagen de perfil.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Actualizar Imagen de Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group controlId="imagenPerfil">
            <Form.Label className="modal-label">Seleccionar nueva imagen</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
              required
            />
          </Form.Group>
          <div className="mt-3 text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Guardar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditarImagen;
