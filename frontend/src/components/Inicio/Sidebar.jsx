// src/components/Inicio/Sidebar.jsx
import {
  Menu,
  Home,
  Calendar,
  Map,
  BarChart2,
  FlaskConical,
  User,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { useUser } from "../../UserContext";
import { FaStackOverflow } from "react-icons/fa";

function SidebarItem({ icon, label, isOpen, to }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);

  return (
    <li>
      <Link
        to={to}
        title={label}
        className={`nav-link d-flex align-items-center rounded w-100 text-white 
    ${isOpen ? "gap-4 justify-content-start ps-2" : "justify-content-center"} 
    ${active ? "active bg-white bg-opacity-25" : ""}`}
      >
        {icon}
        {isOpen && (
          <span style={{ fontSize: "1.15rem", fontWeight: "400" }}>
            {label}
          </span>
        )}
      </Link>
    </li>
  );
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { usuario } = useUser();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
        width: isOpen ? "250px" : "80px",
        zIndex: 1000,
      }}
    >
      <div>
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

        <ul className="nav nav-pills flex-column gap-2">
          <SidebarItem
            icon={<Home size={18} />}
            label="Inicio"
            isOpen={isOpen}
            to="/inicio"
          />
          <SidebarItem
            icon={<Calendar size={18} />}
            label="Calendario"
            isOpen={isOpen}
            to="/calendario"
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
          <SidebarItem
            icon={<FaStackOverflow size={18} />}
            label="Productos"
            isOpen={isOpen}
            to="/productos"
          />
          <SidebarItem
            icon={<FlaskConical size={18} />}
            label="Calculadora"
            isOpen={isOpen}
            to="/calculadora"
          />
          {usuario.rol === "admin" && (
            <SidebarItem
              icon={<User size={18} />}
              label="Panel de control"
              isOpen={isOpen}
              to="/usuarios"
            />
          )}
        </ul>
      </div>

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
  );
}
