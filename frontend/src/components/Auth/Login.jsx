import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import ForgetPassword from "./ForgetPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showForgetPassword, setForgetPassoword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/inicio");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
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
        sessionStorage.setItem("geoAskOnLogin", "1");
        localStorage.removeItem("geoConsent");
        localStorage.removeItem("geoCoords");
        window.location.href = "/inicio";
      } else {
        setLoginError("El correo electrónico o la contraseña son inválidos");
      }
    } catch (error) {
      console.error(error);
      setLoginError("Error al intentar iniciar sesión");
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container d-flex">
        {/* Panel izquierdo */}
        <div className="left-panel text-white position-relative d-flex flex-column justify-content-center align-items-center">
          <h1 className="bienvenido-text">Bienvenido!</h1>
          <img src="/logo.png" alt="TERRAX" className="logo-img" />
        </div>

        {/* Panel derecho */}
        <div className="right-panel position-relative d-flex flex-column justify-content-center align-items-center p-5 bg-dark text-white">
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <h2 className="text-center text-white">Iniciar Sesión</h2>
            <Form onSubmit={handleLogin} autoComplete="off">
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Control
                  type="email"
                  name={email ? "username" : "no-username"}
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.setAttribute("name", "username");
                    e.currentTarget.setAttribute("autocomplete", "username");
                  }}
                  autoComplete="off"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Control
                  type="password"
                  name={email ? "current-password" : "no-password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={email ? "current-password" : "new-password"}
                  required
                />
                {loginError && (
                  <div className="text-danger mt-2">{loginError}</div>
                )}
              </Form.Group>

              <div className="d-flex justify-content-end mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-white"
                  onClick={() => setForgetPassoword(true)}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button
                variant="success"
                type="submit"
                className="w-100 rounded-pill"
              >
                Iniciar Sesión 
              </Button>
            </Form>


            <ForgetPassword
              show={showForgetPassword}
              onHide={() => setForgetPassoword(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
