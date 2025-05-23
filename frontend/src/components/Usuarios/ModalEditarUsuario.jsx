import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const ModalEditarUsuario = ({ show, onHide, usuario, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    rol: "",
    is_active: true,
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        first_name: usuario.first_name || "",
        last_name: usuario.last_name || "",
        username: usuario.username || "",
        email: usuario.email || "",
        rol: usuario.rol || "productor",
        is_active: usuario.is_active ?? true,
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      await axios.patch(`http://localhost:8000/api/usuarios/${usuario.id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onSuccess();
      onHide();
    } catch (err) {
      console.error("Error al actualizar usuario:", err.response?.data || err);
      alert("No se pudo actualizar el usuario");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Nombre</Form.Label>
            <Form.Control
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Apellido</Form.Label>
            <Form.Control
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Username</Form.Label>
            <Form.Control
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="modal-label">Rol</Form.Label>
            <Form.Select name="rol" value={formData.rol} onChange={handleChange}>
              <option value="productor">Productor</option>
              <option value="admin">Administrador</option>
            </Form.Select>
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="Usuario activo"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <div className="text-end mt-3">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarUsuario;
