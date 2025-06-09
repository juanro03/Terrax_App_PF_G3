import React, { useState, useEffect } from "react";
import { useUser } from "../../UserContext";
import { Navigate, useNavigate } from "react-router-dom";
import {
  FaPen,
  FaEnvelope,
  FaUser,
  FaCalendarCheck,
  FaSeedling,
  FaBell,
  FaUserEdit,
} from "react-icons/fa";
import ModalEditarImagen from "./ModalEditarImagen";
import ModalEditarUsuario from "./ModalEditarUsuario";
import axios from "../../axiosconfig";
import "./Perfil.css";

export default function Perfil() {
  const [showModalImg, setShowModalImg] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    lotes: 0,
    tareas: 0,
    alertas: 0,
  });
  const { usuario } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      // Simulamos datos, pero podrías hacer peticiones reales
      setEstadisticas({
        lotes: 12,
        tareas: 42,
        alertas: 5,
      });
    }
  }, [usuario]);

  if (!usuario) return <p className="text-dark">Cargando usuario...</p>;
  if (usuario.rol !== "productor") return <Navigate to="/inicio" replace />;

  return (
    <div className="container mt-4 text-dark">
      <h2 className="mb-4 text-center fw-bold" style={{ color: "#198754" }}>
        Mi perfil
      </h2>

      <div
        className="card p-4 shadow-lg border-0 mx-auto"
        style={{ backgroundColor: "#ffffff", maxWidth: "900px" }}
      >
        {/* Imagen */}
        <div className="text-center mb-3 position-relative perfil-imagen-container mx-auto">
          <img
            src={
              usuario.imagen_perfil
                ? usuario.imagen_perfil.startsWith("http")
                  ? usuario.imagen_perfil
                  : `http://localhost:8000/media/${usuario.imagen_perfil}`
                : "/user.png"
            }
            alt="Imagen de perfil"
            className="rounded-circle perfil-imagen"
          />
          <div className="perfil-overlay" onClick={() => setShowModalImg(true)}>
            <FaPen className="perfil-edit-icon" />
          </div>
        </div>

        <h4 className="text-center fw-bold mb-4" style={{ fontSize: "1.5rem", marginTop: "20px" }}>
          {usuario.first_name} {usuario.last_name}
        </h4>

        {/* Datos */}
        <div className="mb-2 d-flex align-items-center justify-content-center">
          <FaEnvelope className="me-2 text-success" />
          <span>{usuario.email}</span>
        </div>

        <div className="mb-4 d-flex align-items-center justify-content-center">
          <FaUser className="me-2 text-success" />
          <span className="text-capitalize">{usuario.rol}</span>
        </div>

        {/* Estadisticas */}
        <div className="bg-light rounded p-3 mt-3">
          <h6 className="fw-bold text-success mb-3 text-center">
            Resumen de actividad
          </h6>
          <div className="d-flex justify-content-around text-center">
            <div>
              <FaSeedling className="text-success mb-1" />
              <h5 className="fw-bold mb-0">{estadisticas.lotes}</h5>
              <small className="text-muted">Campos</small>
            </div>
            <div>
              <FaCalendarCheck className="text-success mb-1" />
              <h5 className="fw-bold mb-0">{estadisticas.tareas}</h5>
              <small className="text-muted">Tareas</small>
            </div>
            <div>
              <FaBell className="text-success mb-1" />
              <h5 className="fw-bold mb-0">{estadisticas.alertas}</h5>
              <small className="text-muted">Alertas</small>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 text-center">
          <button
            className="btn btn-outline-success me-2"
            onClick={() => navigate("/VerCampos")}
          >
            🌱 Ver mis campos
          </button>
          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/calendario")}
          >
            📅 Ir al calendario
          </button>
        </div>

        {/* Editar perfil */}
        <div className="mt-4 text-center">
          <button
            className="btn btn-success px-4"
            onClick={() => setShowModalEdit(true)}
          >
            <FaUserEdit className="me-2" />
            Editar perfil
          </button>
        </div>
      </div>

      {/* Modales */}
      <ModalEditarImagen
        show={showModalImg}
        onHide={() => setShowModalImg(false)}
        usuarioId={usuario.id}
        onSuccess={() => window.location.reload()}
      />

      <ModalEditarUsuario
        show={showModalEdit}
        onHide={() => setShowModalEdit(false)}
        usuario={usuario}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
