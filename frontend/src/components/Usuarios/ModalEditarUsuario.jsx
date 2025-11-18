// src/components/Usuarios/ModalEditarUsuario.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";
import { useUser } from "../../UserContext";

const ModalEditarUsuario = ({ show, onHide, usuario, onSuccess }) => {
  // Usuario logueado (si el contexto está disponible)
  const { usuario: currentUser } = useUser?.() || {};

  // Rol detectado desde contexto + localStorage como backup
  let storedRole =
    (localStorage.getItem("userRole") ||
      localStorage.getItem("rol") ||
      localStorage.getItem("role") ||
      ""
    ).toLowerCase();

  const effectiveRole = (currentUser?.rol || storedRole || "").toLowerCase();
  const isAdmin =
    effectiveRole === "administrador" || effectiveRole === "admin";

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "",
    telefono: "",
    direccion: "",
    is_active: true,
  });

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.first_name || usuario.nombre || "",
        apellido: usuario.last_name || usuario.apellido || "",
        email: usuario.email || "",
        rol: usuario.rol || "productor",
        telefono: usuario.telefono || "",
        direccion: usuario.direccion || "",
        is_active: usuario.is_active ?? true,
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: form.nombre,
      last_name: form.apellido,
      email: form.email,
      rol: form.rol,
      telefono: form.telefono,
      direccion: form.direccion,
      is_active: form.is_active,
    };

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/usuarios/${usuario.id}/`,
        payload
      );

      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      console.error(
        "Error al actualizar usuario:",
        error.response?.data || error
      );
      alert(
        error.response?.data?.rol?.[0] ||
          error.response?.data?.detail ||
          "Error al actualizar usuario"
      );
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Usuario</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Nombre */}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Apellido */}
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Solo admin ve esto */}
          {isAdmin && (
            <>
              {/* Rol */}
              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Select
                  name="rol"
                  value={form.rol || "productor"}
                  onChange={handleChange}
                >
                  <option value="admin">Administrador</option>
                  <option value="productor">Productor</option>
                </Form.Select>
              </Form.Group>

              {/* Estado */}
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="is_active"
                  value={form.is_active ? "1" : "0"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: e.target.value === "1",
                    }))
                  }
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </>
          )}

          <div className="text-end mt-3">
            <Button variant="secondary" className="me-2" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarUsuario;
