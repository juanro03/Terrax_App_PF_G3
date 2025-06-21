import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from '../../axiosconfig';

export default function RecuperarContraseña({ show, onHide }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/password_reset/', { email });
      setStatus('Si existe una cuenta, recibirás un mail con instrucciones.');
    } catch (err) {
      console.error(err);
      setStatus('Error al enviar el correo. Intenta más tarde.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Recuperar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {status
          ? <p>{status}</p>
          : (
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Ingresa tu correo electrónico para buscar tu cuenta.</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <div className="text-end mt-3">
              <Button variant="secondary" onClick={onHide} className="me-2">
                Cancelar
              </Button>
              <Button type="submit" variant="success">
                Enviar
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}
