import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Usuarios.css";
import { FaEdit, FaTrash, FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ModalEditarImagen from "./ModalEditarImagen";
import ModalEditarPassword from "./ModalEditarPassword";
import ModalCrearUsuario from "./ModalCrearUsuario";
import ModalEditarUsuario from "./ModalEditarUsuario";

const VerUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showImgModal, setShowImgModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/usuarios/");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await axios.delete(`http://localhost:8000/api/usuarios/${id}/`);
        setUsuarios(usuarios.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el usuario");
      }
    }
  };

  const abrirModalImagen = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowImgModal(true);
  };

  const abrirModalPassword = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowPassModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowEditarModal(true);
  };

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#f0f8ff",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Usuarios Registrados</h2>
        <button
          onClick={() => setShowCrearModal(true)}
          className="btn btn-success fw-bold"
        >
          + Agregar Usuario
        </button>
      </div>

      <div className="row">
        {usuarios.map((user) => (
          <div
            key={user.id}
            className="card m-3 p-0 shadow"
            style={{ width: "18rem" }}
          >
            <div className="card-header bg-success text-white text-center fw-bold">
              {user.rol.toUpperCase()}
            </div>
            <div className="card-body text-center">
              <div className="position-relative d-inline-block">
                <img
                  src={user.imagen_perfil}
                  className="rounded-circle mb-3"
                  alt="Perfil"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <FaPen
                  className="position-absolute p-1 rounded-circle border"
                  style={{ cursor: "pointer", fontSize: "24px" }}
                  onClick={() => abrirModalImagen(user)}
                />
              </div>
              <h5 className="card-title text-dark">
                {user.first_name} {user.last_name}
              </h5>
              <p className="card-text text-dark">@{user.username}</p>
              <p className="card-text text-dark">{user.email}</p>
              <p className="card-text text-dark fw-bold">
                Estado: {user.is_active ? "Activo" : "No activo"}
              </p>
              <p
                onClick={() => abrirModalPassword(user)}
                style={{
                  color: "#0d6efd",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Modificar contraseña
              </p>
            </div>
            <div className="card-footer d-flex justify-content-around">
              <button
                className="btn btn-outline-primary"
                onClick={() => abrirModalEditar(user)}
              >
                <FaEdit />
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => handleDelete(user.id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {usuarioSeleccionado && (
        <>
          <ModalEditarImagen
            show={showImgModal}
            onHide={() => setShowImgModal(false)}
            usuarioId={usuarioSeleccionado.id}
            onSuccess={fetchUsuarios}
            method="patch"
          />

          <ModalEditarPassword
            show={showPassModal}
            onHide={() => setShowPassModal(false)}
            usuarioId={usuarioSeleccionado.id}
            onSuccess={fetchUsuarios}
            method="patch"
          />

          <ModalEditarUsuario
            show={showEditarModal}
            onHide={() => setShowEditarModal(false)}
            usuario={usuarioSeleccionado}
            onSuccess={fetchUsuarios}
            method="patch"
          />
        </>
      )}

      <ModalCrearUsuario
        show={showCrearModal}
        onHide={() => setShowCrearModal(false)}
        onSuccess={fetchUsuarios}
      />
    </div>
  );
};

export default VerUsuarios;
