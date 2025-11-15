import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Usuarios.css";
import { FaPen } from "react-icons/fa";
import { Button } from "react-bootstrap";
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
  const [usuarioAConfirmar, setUsuarioAConfirmar] = useState(null);
  const [showConfirmDesactivar, setShowConfirmDesactivar] = useState(false);

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

  const handleDesactivar = async (id) => {{
      try {
        await axios.patch(`/api/usuarios/${id}/desactivar/`);
        setUsuarios(u => u.map(x =>
          x.id === id ? { ...x, is_active: false } : x
        ));
      } catch (e) { alert("No se pudo desactivar"); }
    }
  };

  const handleActivar = async (id) => {
    try {
      await axios.patch(`/api/usuarios/${id}/activar/`);
      setUsuarios(u => u.map(x =>
        x.id === id ? { ...x, is_active: true } : x
      ));
    } catch (e) { alert("No se pudo activar"); }
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
            style={{ width: "150px", height: "32px", backgroundColor: "#d1fae5", }}
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
                <p className="card-text fw-bold text-dark">
                  Estado:&nbsp;
                  <span className={user.is_active ? "text-success" : "text-danger"}>
                    {user.is_active ? "Activo" : "No activo"}
                  </span>
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
                {/* 1- Notificar */}
                <Button
                  variant="outline-success"
                  size="sm"
                  className="rounded-circle"
                  style={{ width: 34, height: 34, borderWidth: 2 }}
                  onClick={() => {
                    setUsuarioParaNotificar(user);
                    setShowNotificarModal(true);
                  }}
                  title="Enviar notificación"
                >
                  <i className="bi bi-envelope" />
                </Button>

                {/* 2- Editar */}
                <Button
                  variant="outline-success"
                  size="sm"
                  className="rounded-circle"
                  style={{ width: 34, height: 34, borderWidth: 2 }}
                  onClick={() => abrirModalEditar(user)}
                  title="Editar usuario"
                >
                  <i className="bi bi-pencil" />
                </Button>

                {/* 3- Activar/Suspender */}
                {user.is_active ? (
                  // Está activo → mostrar ícono de suspensión (papelera)
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="rounded-circle"
                    style={{ width: 34, height: 34, borderWidth: 2 }}
                    title="Suspender usuario"
                    onClick={() => {
                      setUsuarioAConfirmar(user);
                      setShowConfirmDesactivar(true);
                    }}
                  >
                    <i className="bi bi-trash" />
                  </Button>
                ) : (
                  // Está inactivo → mostrar ícono de habilitar (check)
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="rounded-circle"
                    style={{ width: 34, height: 34, borderWidth: 2 }}
                    title="Habilitar usuario"
                    onClick={() => handleActivar(user.id)}
                  >
                    <i className="bi bi-check-lg" />
                  </Button>
                )}


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

      {showConfirmDesactivar && usuarioAConfirmar && (
        <div
          className="confirm-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowConfirmDesactivar(false)}
        >
          <div className="confirm-card p-4">
            <h5 className="fw-bold mb-2">¿Estás seguro que quieres desactivar este usuario?</h5>
            <p className="mb-4">
              El usuario <strong>{usuarioAConfirmar.nombre || usuarioAConfirmar.username}</strong> perderá acceso a su cuenta.
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmDesactivar(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await handleDesactivar(usuarioAConfirmar.id);
                  setShowConfirmDesactivar(false);
                }}
              >
                Sí, desactivar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VerUsuarios;
