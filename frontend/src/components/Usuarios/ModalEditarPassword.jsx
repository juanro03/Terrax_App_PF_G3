import React, { useState } from "react";
import axios from "../../axiosconfig";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Usuarios.css";

const ModalEditarPassword = ({ show, onHide, usuarioId, onSuccess }) => {
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    // al cerrar, limpio campos
    setNueva("");
    setConfirmar("");
    setMostrarNueva(false);
    setMostrarConfirmar(false);
    onHide();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nueva || !confirmar) {
      alert("Completá ambos campos.");
      return;
    }

    if (nueva !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:8000/api/usuarios/${usuarioId}/cambiar-password/`,
        { nueva, confirmar },
        { headers: { "Content-Type": "application/json" } }
      );

      // callback externo (para refrescar lista, etc.)
      onSuccess && onSuccess();

      alert("Contraseña actualizada correctamente.");
      handleClose();
    } catch (error) {
      console.error("Error al cambiar contraseña:", error.response?.data || error);
      alert(
        error.response?.data?.detail ||
          "No se pudo cambiar la contraseña. Revisá la consola."
      );
    } finally {
      setLoading(false);
    }
  };

  const eyeStyle = {
    width: "2.5rem",
    height: "calc(1.5em + 1.4rem + 2px)",
    cursor: "pointer",
    borderTopRightRadius: ".25rem",
    borderBottomRightRadius: ".25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cambiar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Nueva Contraseña */}
          <Form.Group className="mb-3">
            <Form.Label>Nueva Contraseña</Form.Label>
            <InputGroup className="input-group">
              <Form.Control
                className="rounded-start"
                type={mostrarNueva ? "text" : "password"}
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                required
              />
              <InputGroup.Text
                className="rounded-end p-0"
                style={eyeStyle}
                onMouseDown={() => setMostrarNueva(true)}
                onMouseUp={() => setMostrarNueva(false)}
                onMouseLeave={() => setMostrarNueva(false)}
              >
                {mostrarNueva ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {/* Confirmar Contraseña */}
          <Form.Group className="mb-3">
            <Form.Label>Confirmar Contraseña</Form.Label>
            <InputGroup className="input-group">
              <Form.Control
                className="rounded-start"
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
              />
              <InputGroup.Text
                className="rounded-end p-0"
                style={eyeStyle}
                onMouseDown={() => setMostrarConfirmar(true)}
                onMouseUp={() => setMostrarConfirmar(false)}
                onMouseLeave={() => setMostrarConfirmar(false)}
              >
                {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <div className="text-end">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="me-2"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? "Guardando..." : "Cambiar"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarPassword;
