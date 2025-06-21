import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from '../../axiosconfig';

export default function RecuperarContraseña({ show, onHide }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!show) {
      setEmail('');
      setStatus(null);
      setSending(false);
    }
  }, [show]);

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post('/api/auth/password_reset/', { email });
      setStatus('Si existe una cuenta, recibirás un mail con instrucciones.');
    } catch (err) {
      console.error(err);
      setStatus('Error al enviar el correo. Intenta más tarde.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recuperar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {status ? (
          <Alert variant="info">{status}</Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={onHide} className="me-2">
                Cancelar
              </Button>
              <Button type="submit" variant="success" disabled={sending}>
                {sending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}
