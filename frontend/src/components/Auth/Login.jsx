import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./login.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/inicio");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        window.location.href = "/inicio";
      } else {
        alert("Credenciales inválidas");
      }
    } catch (error) {
      alert("Error al intentar iniciar sesión");
      console.error(error);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container d-flex">
        {/* Panel izquierdo */}
        <div className="left-panel text-white position-relative d-flex flex-column justify-content-center align-items-center">
          <h1 className="bienvenido-text">Bienvenido!</h1>
            <img
              src="/logo.png"
              alt="TERRAX"
              className="logo-img"
            />
        </div>

        {/* Panel derecho */}
        <div className="right-panel position-relative d-flex flex-column justify-content-center align-items-center p-5 bg-dark text-white">
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <h2 className="text-center text-white">Iniciar Sesión</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Control
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <a href="#" className="text-decoration-none text-white">
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
    </div>
  );
};

export default Login;
