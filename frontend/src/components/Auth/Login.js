import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // agregamos el archivo CSS personalizado

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin@example.com" && password === "admin") {
      localStorage.setItem("auth", "true");
      navigate("/usuarios");
    } else {
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="login-card d-flex shadow rounded overflow-hidden">
        {/* Lado izquierdo con imagen */}
        <div className="login-left d-flex flex-column justify-content-center align-items-center text-white p-4">
          <h1 className="fw-bold">¡Bienvenido!</h1>
          <img src="./logo.png" alt="Terrax" className="logo-img mt-3" />
        </div>

        {/* Lado derecho con formulario */}
        <div className="login-right bg-dark text-white p-5 d-flex flex-column justify-content-center">
          <h4 className="fw-bold mb-4">Iniciar sesión</h4>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Recordar contraseña
              </label>
              <a
                href="/"
                className="text-light ms-3"
                style={{ fontSize: "0.9rem" }}
              >
                ¿Olvidó su contraseña?
              </a>
            </div>
            <button type="submit" className="btn btn-success w-100 fw-bold">
              Iniciar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
