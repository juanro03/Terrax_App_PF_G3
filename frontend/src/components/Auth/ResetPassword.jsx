import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../axiosconfig';
import { Form, Button, Alert } from 'react-bootstrap';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const uid = params.get('uid');
  const token = params.get('token');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (status) window.scrollTo(0, 0);
  }, [status]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (pw1 !== pw2) {
      setStatus('Las contraseñas no coinciden');
      return;
    }
    setSending(true);
    try {
      await axios.post('/api/auth/password_reset/confirm/', {
        uid,
        token,
        new_password: pw1,
        re_new_password: pw2
      });
      setStatus('Contraseña cambiada con éxito. Redirigiendo...');
      setTimeout(() => nav('/login'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('Error al cambiar la contraseña. El enlace puede haber expirado.');
    } finally {
      setSending(false);
    }
  };

  if (!uid || !token) return <p>Enlace inválido o incompleto.</p>;

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h3 className="mb-4">Restablecer contraseña</h3>
      {status && <Alert variant="info">{status}</Alert>}
      {!status && (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nueva contraseña</Form.Label>
            <Form.Control
              type="password"
              value={pw1}
              onChange={e => setPw1(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Repetir contraseña</Form.Label>
            <Form.Control
              type="password"
              value={pw2}
              onChange={e => setPw2(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" variant="success" disabled={sending}>
            {sending ? 'Cambiando...' : 'Cambiar'}
          </Button>
        </Form>
      )}
    </div>
  );
}
