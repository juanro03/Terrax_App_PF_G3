import { useState } from "react";
import {
  Menu,
  Home,
  Calendar,
  Map,
  BarChart2,
  FlaskConical,
  ChevronDown,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <div
        className={`bg-success text-white h-100 shadow-sm transition-all p-3 d-flex flex-column justify-content-between rounded-end ${isOpen ? "" : "collapsed-sidebar"}`}
        style={{ width: isOpen ? "250px" : "70px" }}
      >
        <div>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <button onClick={toggleSidebar} className="btn btn-outline-light btn-sm">
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
            <SidebarItem icon={<Home size={18} />} label="Inicio" isOpen={isOpen} to="/" />
            <SidebarItem icon={<Calendar size={18} />} label="Calendario" isOpen={isOpen} to="/calendario" />
            <SidebarItem icon={<Map size={18} />} label="Campos" isOpen={isOpen} to="/ver-campos" />
            <SidebarItem icon={<BarChart2 size={18} />} label="Reportes" isOpen={isOpen} to="/reportes" />
            <SidebarItem icon={<FlaskConical size={18} />} label="Calculadora" isOpen={isOpen} to="/calculadora" />
            <SidebarItem icon={<User size={18} />} label="Usuarios" isOpen={isOpen} to="/usuarios" />
            <SidebarItem icon={<User size={18} />} label="Administracion" isOpen={isOpen} to="/usuarios" />
          </ul>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center gap-2">
          <img
            src="https://i.pravatar.cc/32?u=juancito"
            alt="Avatar"
            className="rounded-circle"
            width="32"
            height="32"
          />
          {isOpen && (
            <div className="d-flex align-items-center gap-1 small">
              <span>Juan Perez</span>
              <ChevronDown size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 p-4 bg-white">
        {/* Tu contenido principal */}
      </div>

      {/* Estilos para el efecto hover */}
      <style>
        {`
          .sidebar-item {
            margin-bottom: 0.4rem;
          }

          .sidebar-link {
            padding: 6px;
            display: flex;
            align-items: center;
            text-decoration: none;
          }

          .icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
          }

          .sidebar-link:hover .icon-wrapper {
            background-color: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </div>
  );
}

function SidebarItem({ icon, label, isOpen, to }) {
  return (
    <li className="sidebar-item">
      <Link
        to={to}
        className="sidebar-link nav-link text-white d-flex align-items-center"
      >
        <div className="icon-wrapper">{icon}</div>
        {isOpen && <span className="ms-2">{label}</span>}
      </Link>
    </li>
  );
}

