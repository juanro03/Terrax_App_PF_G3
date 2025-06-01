import React from "react";
import { useUser } from "../../UserContext";
import { Navigate } from "react-router-dom";

export default function Perfil() {
  const { usuario } = useUser();

  if (!usuario) return <p className="text-dark">Cargando usuario...</p>;
  if (usuario.rol !== "productor") return <Navigate to="/inicio" replace />;

  return (
    <div className="container mt-4 text-dark">
      <h2 className="mb-4" style={{ fontWeight: "bold", color: "#198754" }}>
        Mi perfil
      </h2>

      <div
        className="card p-4 shadow-sm border-0"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Imagen de perfil */}
        <div className="text-center mb-4">
          <img
            src={
              usuario.imagen_perfil
                ? usuario.imagen_perfil.startsWith("http")
                  ? usuario.imagen_perfil
                  : `http://localhost:8000/media/${usuario.imagen_perfil}`
                : "/user.png"
            }
            alt="Imagen de perfil"
            className="rounded-circle"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "3px solid #198754",
            }}
          />
        </div>

        {/* Datos personales */}
        <div className="mb-3">
          <label className="form-label text-dark">Nombre</label>
          <div className="form-control-plaintext bg-light rounded p-2">
            {usuario.first_name}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-dark">Apellido</label>
          <div className="form-control-plaintext bg-light rounded p-2">
            {usuario.last_name}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-dark">Correo electrónico</label>
          <div className="form-control-plaintext bg-light rounded p-2">
            {usuario.email}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-dark">Rol</label>
          <div className="form-control-plaintext bg-light rounded p-2">
            {usuario.rol}
          </div>
        </div>
      </div>
    </div>
  );
}
