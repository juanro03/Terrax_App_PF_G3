import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./login.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/api/auth/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("accessToken", data.access || data.key);
      alert("Login exitoso");
      navigate("/inicio");
      // Redirigir o actualizar estado de sesión si querés
    } else {
      alert("Error: " + (data.detail || "Credenciales inválidas"));
    }
  };

  return (
    <div className="login-container d-flex vh-100">
      {/* Panel izquierdo */}
      <div className="left-panel text-white d-flex flex-column justify-content-center align-items-center"></div>

      {/* Panel derecho */}
      <div
        className="right-panel position-relative d-flex flex-column justify-content-center align-items-center p-5 bg-dark text-white"
        style={{ width: "50%", position: "relative" }}
      >
        {/* Logo centrado arriba */}
        <img
          src="/logo.png"
          alt="TERRAX"
          className="position-absolute"
          style={{
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "800px",
            height: "auto",
          }}
        />

        {/* Login */}
        <div style={{ marginTop: "100px", width: "100%", maxWidth: "400px" }}>
          <h2 className="mb-4 text-center">Iniciar Sesión</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Control
                type="text"
                placeholder="Nombre de Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <div className="d-flex justify-content-between mb-3">
              <Form.Check type="checkbox" label="Recordar contraseña" />
              <a href="#" className="text-decoration-none text-primary">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              variant="success"
              type="submit"
              className="w-100 rounded-pill"
            >
              Iniciar
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
