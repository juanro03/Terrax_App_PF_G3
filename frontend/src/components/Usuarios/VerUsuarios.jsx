import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Usuarios.css";
import { FaEdit, FaTrash, FaPen, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ModalEditarImagen from "./ModalEditarImagen";
import ModalEditarPassword from "./ModalEditarPassword";
import ModalCrearUsuario from "./ModalCrearUsuario";
import ModalEditarUsuario from "./ModalEditarUsuario";
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
  const [showNotificarModal, setShowNotificarModal] = useState(false);
  const [usuarioParaNotificar, setUsuarioParaNotificar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchUsuarios(); }, []);
  const fetchUsuarios = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/usuarios/");
      setUsuarios(data);
    } catch (e) { console.error("Error al obtener usuarios:", e); }
  };

  const handleDesactivar = async (id) => {
    if (!window.confirm("¿Desactivar este usuario?")) return;
    try {
      await axios.patch(`/api/usuarios/${id}/desactivar/`);
      setUsuarios(u => u.map(x => x.id === id ? { ...x, is_active: false } : x));
    } catch { alert("No se pudo desactivar"); }
  };

  const handleActivar = async (id) => {
    try {
      await axios.patch(`/api/usuarios/${id}/activar/`);
      setUsuarios(u => u.map(x => x.id === id ? { ...x, is_active: true } : x));
    } catch { alert("No se pudo activar"); }
  };

  const abrirModalImagen = (usuario) => { setUsuarioSeleccionado(usuario); setShowImgModal(true); };
  const abrirModalPassword = (usuario) => { setUsuarioSeleccionado(usuario); setShowPassModal(true); };
  const abrirModalEditar = (usuario) => { setUsuarioSeleccionado(usuario); setShowEditarModal(true); };

  const limpiarFiltros = () => { setFiltroBusqueda(""); setFiltroRol("todos"); };

  const listaFiltrada = usuarios.filter((u) => {
    const q = filtroBusqueda.toLowerCase();
    const nombre = `${u.first_name} ${u.last_name}`.toLowerCase();
    const username = u.username.toLowerCase();
    const rol = u.rol.toLowerCase();
    return (nombre.includes(q) || username.includes(q)) && (filtroRol === "todos" || rol === filtroRol);
  });

  return (
    <div className="usuarios-page" style={{ backgroundColor: "#e9fbe5", minHeight: "100vh", padding: 20 }}>
      <div className="usuarios-shell mx-auto my-5 shadow">
        <div className="p-4 p-sm-5">
          {/* Título */}
          <h2>Usuarios Registrados</h2>

          {/* Botón Agregar */}
          <div className="d-flex justify-content-center mb-3">
            <button
              onClick={() => setShowCrearModal(true)}
              className="btn btn-success fw-semibold px-4 u-btn"
            >
              + Agregar Usuario
            </button>
          </div>

          {/* Toolbar: buscador + filtros (misma altura) */}
          <div className="usuarios-toolbar">
            <input
              type="text"
              className="form-control u-control"
              style={{ maxWidth: 520, minWidth: 260 }}
              placeholder="Buscar nombre o usuario"
              value={filtroBusqueda}
              onChange={(e) => setFiltroBusqueda(e.target.value)}
            />
            <select
              className="form-select u-control"
              style={{ width: 200 }}
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="productor">Productor</option>
            </select>
            <button className="btn btn-outline-secondary u-btn" onClick={limpiarFiltros}>
              Limpiar
            </button>
          </div>

          {/* Grid de tarjetas centrada */}
          <div className="usuarios-grid">
            {listaFiltrada.map((user) => (
              <div key={user.id} className="card usuarios-card h-90">
                <div className="card-header text-white text-center fw-bold">
                  {user.rol?.toUpperCase()}
                </div>

                <div className="card-body text-center">
                  <div className="position-relative d-inline-block mb-2">
                    <img
                      src={user.imagen_perfil}
                      alt="Perfil"
                      className="rounded-circle"
                      style={{ width: 86, height: 86, objectFit: "cover" }}
                    />
                    <FaPen
                      className="avatar-edit"
                      title="Cambiar imagen"
                      onClick={() => abrirModalImagen(user)}
                    />
                  </div>

                  <h5 className="card-title text-dark mb-1">
                    {user.first_name} {user.last_name}
                  </h5>
                  <p className="text-dark mb-1">@{user.username}</p>
                  <p className="text-dark mb-2">{user.email}</p>

                  <p className="fw-bold text-dark mb-2">
                    Estado:&nbsp;
                    <span className={user.is_active ? "text-success" : "text-danger"}>
                      {user.is_active ? "Activo" : "No activo"}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={() => abrirModalPassword(user)}
                    className="btn btn-link p-0"
                    style={{ color: "#198754", textDecoration: "underline" }}
                  >
                    Modificar contraseña
                  </button>
                </div>

                <div className="card-footer d-flex justify-content-around">
                  <button
                    className="btn btn-outline-success"
                    title="Notificar por email"
                    onClick={() => { setUsuarioParaNotificar(user); setShowNotificarModal(true); }}
                  >
                    <FaEnvelope />
                  </button>

                  <button className="btn btn-outline-primary" title="Editar" onClick={() => abrirModalEditar(user)}>
                    <FaEdit />
                  </button>

                  {user.is_active ? (
                    <button className="btn btn-outline-danger" title="Suspender" onClick={() => handleDesactivar(user.id)}>
                      <FaTrash />
                    </button>
                  ) : (
                    <button className="btn btn-outline-success" title="Habilitar" onClick={() => handleActivar(user.id)}>
                      ✅
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
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
