import { useState } from "react";
import {
  Menu,
  Home,
  Calendar,
  Map,
  BarChart2,
  FlaskConical,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useUser } from "../../UserContext";

function SidebarItem({ icon, label, isOpen, to }) {
  return (
    <li>
      <Link
        to={to}
        className="nav-link d-flex align-items-center gap-2 rounded w-100 text-white"
      >
        {icon}
        {isOpen && <span>{label}</span>}
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { usuario } = useUser();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  if (!usuario) return null;

  return (
    <div
      className={`bg-success text-white shadow-sm transition-all p-3 d-flex flex-column justify-content-between rounded-end ${
        isOpen ? "" : "collapsed-sidebar"
      }`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: isOpen ? "250px" : "70px",
        zIndex: 1000,
      }}
    >
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button onClick={toggleSidebar} className="btn btn-outline-light btn-sm">
            <Menu size={20} />
          </button>
          {isOpen && (
            <img src="/logo.png" alt="Terrax Logo" className="img-fluid" style={{ maxWidth: "200px" }} />
          )}
        </div>

        <ul className="nav nav-pills flex-column gap-2">
          <SidebarItem icon={<Home size={18} />} label="Inicio" isOpen={isOpen} to="/inicio" />
          <SidebarItem icon={<Calendar size={18} />} label="Calendario" isOpen={isOpen} to="/calendario" />
          {usuario.rol === "productor" && (
            <SidebarItem icon={<Map size={18} />} label="Mis campos" isOpen={isOpen} to="/VerCampos" />
          )}
          <SidebarItem icon={<BarChart2 size={18} />} label="Reportes" isOpen={isOpen} to="/reportes" />
          <SidebarItem icon={<FlaskConical size={18} />} label="Calculadora" isOpen={isOpen} to="/calculadora" />
          {usuario.rol === "admin" && (
            <SidebarItem icon={<User size={18} />} label="Panel de control" isOpen={isOpen} to="/usuarios" />
          )}
        </ul>
      </div>

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
          {isOpen && (
            <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>
              {usuario.first_name} {usuario.last_name}
            </span>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="text-dark">
          <Dropdown.Item
            onMouseOver={(e) => (e.target.style.backgroundColor = "#198754")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "")}
            onClick={() => navigate("/perfil")}
          >
            Ver perfil
          </Dropdown.Item>
          <Dropdown.Item
            onMouseOver={(e) => (e.target.style.backgroundColor = "#198754")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "")}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}