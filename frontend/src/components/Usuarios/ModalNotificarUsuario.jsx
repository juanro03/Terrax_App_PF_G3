// ModalNotificarUsuario.jsx
import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../../axiosconfig";

const ModalNotificarUsuario = ({ show, onHide, usuarioId }) => {
  const [enviando, setEnviando] = useState(false);

  // ✅ NUEVO: cartel de éxito y error (sin alert del navegador)
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleEnviar = async () => {
    setEnviando(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:8000/api/notificar/",
        { usuario_id: usuarioId }
      );

      // ✅ mostrar cartel centrado y cerrar solo
      setShowSuccess(true);
      timerRef.current = setTimeout(() => {
        setShowSuccess(false);
        onHide();
      }, 1700);
    } catch (error) {
      console.error("STATUS:", error.response?.status, error.response?.data);
      setError("Error al enviar la notificación ❌");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => {
          if (!enviando) {
            setError("");
            onHide();
          }
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Enviar notificación de mora</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <div className="alert alert-danger mb-3">{error}</div>}

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

      {/* ✅ Cartel centrado tipo SolicitarServicio (sin tocar CSS) */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "22px 26px",
              width: "min(520px, 92vw)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
              border: "2px solid #198754",
            }}
          >
            <h4 style={{ margin: 0, color: "#198754", fontWeight: 700 }}>
              ✅ Notificación enviada
            </h4>
            <p style={{ margin: "10px 0 0", color: "#333" }}>
              El correo se envió correctamente.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalNotificarUsuario;
