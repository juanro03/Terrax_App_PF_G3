import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const ModalCrearUsuario = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    rol: "productor",
    is_active: true,
  });
  const [imagenPerfil, setImagenPerfil] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setImagenPerfil(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) data.append(key, formData[key]);
    if (imagenPerfil) data.append("imagen_perfil", imagenPerfil);

    try {
      await axios.post("http://localhost:8000/api/usuarios/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
      onHide();
    } catch (err) {
      console.error("Error al crear usuario:", err);
      alert("No se pudo crear el usuario");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear Usuario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control name="first_name" value={formData.first_name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control name="last_name" value={formData.last_name} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control name="username" value={formData.username} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control name="email" type="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control name="password" type="password" value={formData.password} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select name="rol" value={formData.rol} onChange={handleChange}>
              <option value="productor">Productor</option>
              <option value="admin">Administrador</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Imagen de Perfil</Form.Label>
            <Form.Control type="file" name="imagen_perfil" accept="image/*" onChange={handleFileChange} required />
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="Usuario activo"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <div className="text-end mt-3">
            <Button variant="secondary" onClick={onHide} className="me-2">Cancelar</Button>
            <Button type="submit" variant="success">Crear</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCrearUsuario;