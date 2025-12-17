// src/components/Inicio/Sidebar.jsx
import {
  Menu,
  Home,
  Calendar,
  Map,
  BarChart2,
  FlaskConical,
  User,
  Wrench,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useUser } from "../../UserContext";
import { FaStackOverflow } from "react-icons/fa";
import { Sprout } from "lucide-react";
import { useState } from "react";
import SolicitarServicio from "../campos/SolicitarServicio";
import Dashboard from "../Estadisticas/Dashboard";
function SidebarItem({ icon, label, isOpen, to, onClick }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);

  return (
    <div>
      <Link
        to={to}
        title={label}
        onClick={onClick}
        className={`nav-link d-flex align-items-center rounded w-100 text-white 
          ${
            isOpen
              ? "gap-4 justify-content-start ps-2"
              : "justify-content-center"
          } 
          ${active ? "active bg-white bg-opacity-25" : ""}`}
      >
        {icon}
        {isOpen && (
          <span style={{ fontSize: "1.15rem", fontWeight: "400" }}>
            {label}
          </span>
        )}
      </Link>
    </div>
  );
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { usuario } = useUser();
  const [showModal, setShowModal] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (!usuario) return null;

  return (
    <>
      <div
        className={`bg-success text-white shadow-sm transition-all p-3 d-flex flex-column justify-content-between rounded-end ${
          isOpen ? "" : "collapsed-sidebar"
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: isOpen ? "250px" : "80px",
          zIndex: 1000,
        }}
      >
        <div>
          {/* Logo + botón colapsar */}
          <div
            className={`d-flex align-items-center mb-3 mt-3 ${
              isOpen
                ? "justify-content-start px-2 gap-2"
                : "justify-content-center"
            }`}
          >
            <div>
              <button
                onClick={toggleSidebar}
                className="btn btn-outline-light btn-sm"
              >
                <Menu size={22} />
              </button>
            </div>

            <div>
              {isOpen && (
                <img
                  src="/logo.png"
                  alt="Terrax Logo"
                  style={{
                    marginLeft: "20px",
                    marginTop: "5px",
                    height: "42px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </div>

          {/* Items principales */}
          <ul className="nav nav-pills flex-column gap-2">
            <SidebarItem
              icon={<Home size={18} />}
              label="Inicio"
              isOpen={isOpen}
              to="/inicio"
            />
            {usuario.rol === "productor" && (
              <SidebarItem
                icon={<Map size={18} />}
                label="Mis campos"
                isOpen={isOpen}
                to="/VerCampos"
              />
            )}
            <SidebarItem
              icon={<BarChart2 size={18} />}
              label="Reportes"
              isOpen={isOpen}
              to="/reportes"
            />
            {usuario.rol === "productor" && (
              <SidebarItem
                icon={<Sprout size={18} />}
                label="Tareas Agrícolas"
                isOpen={isOpen}
                to="/tareas"
              />
            )}
            {usuario.rol === "productor" && (
              <SidebarItem
                icon={<Calendar size={18} />}
                label="Calendario"
                isOpen={isOpen}
                to="/calendario"
              />
            )}
            {usuario.rol === "productor" && (
              <SidebarItem
                icon={<FaStackOverflow size={18} />}
                label="Productos"
                isOpen={isOpen}
                to="/productos"
              />
            )}
            <SidebarItem
              icon={<FlaskConical size={18} />}
              label="Calculadora"
              isOpen={isOpen}
              to="/calculadora"
            />
            {usuario.rol === "productor" && (
              <SidebarItem
                icon={<i class="bi bi-exclamation-triangle"></i>}
                label="Alertas Climáticas"
                isOpen={isOpen}
                to="/alertas"
              />
            )}
            {usuario.rol === "admin" && (
              <SidebarItem
                icon={<User size={18} />}
                label="Panel de control"
                isOpen={isOpen}
                to="/usuarios"
              />
            )}
            {usuario.rol === "admin" && (
              <SidebarItem
                icon={<User size={18} />}
                label="Gestión de Usuarios"
                isOpen={isOpen}
                to="/dashboard"
              />
            )}
          </ul>
        </div>

        {/* Contenedor inferior con botón + usuario */}
        <div className="d-flex flex-column">
          {/* Botón Solicitar Servicio justo encima del usuario */}
          <div
            className={`d-flex ${
              isOpen ? "justify-content-start" : "justify-content-center"
            } mb-2`}
          >
            {usuario.rol === "productor" && (

              <button
                onClick={() => setShowModal(true)}
                className={`btn btn-outline-light d-flex align-items-center gap-2 w-100 ${isOpen ? "px-3" : "justify-content-center"
                  }`}
                style={{
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                <Wrench size={18} />
                {isOpen && <span>Solicitar Servicio</span>}
              </button>
            )}
          </div>

          {/* Renderizar modal */}
          {showModal && (
            <SolicitarServicio onClose={() => setShowModal(false)} />
          )}

          {/* Usuario logeado */}
          {isOpen ? (
            <Dropdown drop="up">
              <Dropdown.Toggle
                variant="outline-light"
                size="lg"
                className="d-flex align-items-center gap-2 border-0 bg-transparent text-white"
                id="dropdown-user"
                style={{ fontSize: "1rem" }}
              >
                <img
                  src={usuario?.imagen_perfil || "/user.png"}
                  alt="Avatar"
                  className="rounded-circle"
                  width="32"
                  height="32"
                  style={{ objectFit: "cover" }}
                />
                <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>
                  {usuario.first_name} {usuario.last_name}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="text-dark">
                <Dropdown.Item onClick={() => navigate("/perfil")}>
                  Ver perfil
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    navigate("/login");
                  }}
                >
                  Cerrar sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div className="d-flex justify-content-center">
              <img
                src={usuario?.imagen_perfil || "/user.png"}
                alt="Avatar"
                className="rounded-circle"
                width="40"
                height="40"
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
