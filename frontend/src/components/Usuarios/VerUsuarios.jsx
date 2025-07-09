import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Usuarios.css";
import { FaEdit, FaTrash, FaPen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ModalEditarImagen from "./ModalEditarImagen";
import ModalEditarPassword from "./ModalEditarPassword";
import ModalCrearUsuario from "./ModalCrearUsuario";
import ModalEditarUsuario from "./ModalEditarUsuario";
import { FaEnvelope } from "react-icons/fa";
import ModalNotificarUsuario from "./ModalNotificarUsuario";


const VerUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showImgModal, setShowImgModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const navigate = useNavigate();
  const [showNotificarModal, setShowNotificarModal] = useState(false);
  const [usuarioParaNotificar, setUsuarioParaNotificar] = useState(null);


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

  const limpiarFiltros = () => {
    setFiltroBusqueda("");
    setFiltroRol("todos");
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
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ gap: "10px", flexWrap: "wrap" }}
      >
        {/* Izquierda: Título y filtros */}
        <div className="d-flex align-items-center flex-grow-1 flex-wrap gap-2">
          <h2 className="fw-bold mb-0 me-2" style={{ whiteSpace: "nowrap" }}>
            Usuarios Registrados
          </h2>

          <input
            type="text"
            className="form-control form-control-sm"
            style={{
              height: "32px",
              backgroundColor: "#d1fae5",
              width: "450px",
              marginLeft: 100,
              marginTop: 0,
              marginBottom: 0,
            }}
            placeholder="Buscar nombre o usuario"
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />

          <select
            className="form-select form-select-sm"
            style={{ width: "150px", height: "32px", backgroundColor: "#d1fae5",}}
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="productor">Productor</option>
          </select>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        </div>

        {/* Derecha: Botón agregar */}
        <button
          onClick={() => setShowCrearModal(true)}
          className="btn btn-success fw-bold btn-sm"
          style={{ whiteSpace: "nowrap" }}
        >
          + Agregar Usuario
        </button>
      </div>

      {/* Tarjetas de usuarios */}
      <div className="row">
        {usuarios
          .filter((user) => {
            const busqueda = filtroBusqueda.toLowerCase();
            const nombreCompleto =
              `${user.first_name} ${user.last_name}`.toLowerCase();
            const username = user.username.toLowerCase();
            const rol = user.rol.toLowerCase();

            return (
              (nombreCompleto.includes(busqueda) ||
                username.includes(busqueda)) &&
              (filtroRol === "todos" || rol === filtroRol)
            );
          })
          .map((user) => (
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
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
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
                <button
                  className="btn btn-outline-success"
                  onClick={() => {
                      setUsuarioParaNotificar(user);
                      setShowNotificarModal(true);
                  }}
                >
                  <FaEnvelope />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Modales */}
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

{usuarioParaNotificar && (
  <ModalNotificarUsuario
    show={showNotificarModal}
    onHide={() => setShowNotificarModal(false)}
    usuarioId={usuarioParaNotificar.id}
  />
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
