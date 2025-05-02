import { useState } from "react";
import {
  Menu,
  Home,
  Calendar,
  Map,
  BarChart2,
  FlaskConical,
  ChevronDown,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-green-900 text-white h-full shadow-lg transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-20"} flex flex-col justify-between rounded-tr-3xl rounded-br-3xl`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <button onClick={toggleSidebar} className="text-white">
              <Menu size={24} />
            </button>
            {isOpen && (
              <img
                src="/logo.png"
                alt="Terrax Logo"
                className="w-50"
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-6 space-y-2 px-3">
            <SidebarItem icon={<Home size={20} />} label="Inicio" isOpen={isOpen} active />
            <SidebarItem icon={<Calendar size={20} />} label="Calendario" isOpen={isOpen} />
            <SidebarItem icon={<Map size={20} />} label="Campos" isOpen={isOpen} />
            <SidebarItem icon={<BarChart2 size={20} />} label="Reportes" isOpen={isOpen} />
            <SidebarItem icon={<FlaskConical size={20} />} label="Calculadora" isOpen={isOpen} />
          </nav>
        </div>

        {/* Footer */}
        <div className="px-3 py-4 bg-green-800 flex items-center justify-between rounded-bl-3xl">
          <img
            src="https://i.pravatar.cc/32?u=juancito"
            alt="Avatar"
            className="rounded-full w-8 h-8"
          />
          {isOpen && (
            <div className="flex items-center gap-1 text-sm">
              <span>Juan Perez</span>
              <ChevronDown size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">{/* Tu contenido principal */}</div>
    </div>
  );
}

function SidebarItem({ icon, label, isOpen, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
        active
          ? "bg-blue-600 text-white"
          : "hover:bg-green-700 text-gray-200"
      }`}
    >
      {icon}
      {isOpen && <span className="whitespace-nowrap">{label}</span>}
    </div>
  );
}
