import { useState, useEffect } from "react";
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
import axios from "../../axiosconfig";

/*Para obtener el usuario logueado y mostrarlo en el sidebar*/
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

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
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.log("No hay token");
        return;
      }

      const decoded = parseJwt(token);
      console.log("Token decodificado:", decoded);

      const userId = decoded?.user_id; 
      if (!userId) {
        console.log("No se encontró userId en el token");
        return;
      }

      try {
        const res = await axios.get(`/usuarios/${userId}/`);
        console.log("Datos de usuario:", res.data);
        setUsuario(res.data);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
      }
    };

    fetchUsuario();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            onClick={toggleSidebar}
            className="btn btn-outline-light btn-sm"
          >
            <Menu size={20} />
          </button>
          {isOpen && (
            <img
              src="/logo.png"
              alt="Terrax Logo"
              className="img-fluid"
              style={{ maxWidth: "200px" }}
            />
          )}
        </div>

        {/* Navigation */}
        <ul className="nav nav-pills flex-column gap-2">
          <SidebarItem
            icon={<Home size={18} />}
            label="Inicio"
            isOpen={isOpen}
            to="/"
          />
          <SidebarItem
            icon={<Calendar size={18} />}
            label="Calendario"
            isOpen={isOpen}
            to="/calendario"
          />
          <SidebarItem
            icon={<Map size={18} />}
            label="Campos"
            isOpen={isOpen}
            to="/ver-campos"
          />
          <SidebarItem
            icon={<BarChart2 size={18} />}
            label="Reportes"
            isOpen={isOpen}
            to="/reportes"
          />
          <SidebarItem
            icon={<FlaskConical size={18} />}
            label="Calculadora"
            isOpen={isOpen}
            to="/calculadora"
          />
          <SidebarItem
            icon={<User size={18} />}
            label="Usuarios"
            isOpen={isOpen}
            to="/usuarios"
          />
        </ul>
      </div>

      {/* Footer con dropdown de usuario */}
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
          {isOpen && usuario && (
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
