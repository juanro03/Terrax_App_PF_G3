import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Campos.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import ModalCrearCampo from "./ModalCrearCampo";
import ModalEditarCampo from "./ModalEditarCampo";
import { useNavigate } from "react-router-dom";
import SolicitarServicio from "./SolicitarServicio";

const VerCampos = () => {
  const [campos, setCampos] = useState([]);
  const [showCrear, setShowCrear] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [campoSeleccionado, setCampoSeleccionado] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchCampos(); }, []);

  const fetchCampos = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/campos/");
      setCampos(data);
    } catch (e) {
      console.error("Error al obtener los campos:", e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este campo?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/campos/${id}/`);
      fetchCampos();
    } catch (e) {
      console.error("Error al eliminar el campo:", e);
    }
  };

  const handleEditar = (campo) => {
    setCampoSeleccionado(campo);
    setShowEditar(true);
  };

  // lista filtrada
  const lista = campos.filter((c) => {
    const t = filtroTexto.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(t) ||
      c.localidad.toLowerCase().includes(t) ||
      c.provincia.toLowerCase().includes(t)
    );
  });

  return (
    <div className="campos-page">
      {/* Caja blanca central tipo “Usuarios” */}
      <div className="mx-auto my-5 shadow campos-shell">
        <div className="p-4 p-sm-5">
          {/* Header: título a la izquierda, botones a la derecha */}
          <div className="campos-header">
            <h2 className="campos-title text-3xl fw-bold mb-0">Campos Registrados</h2>

            <div className="header-actions">
              <button
                className="btn btn-success fw-semibold px-4 py-2 rounded-3"
                onClick={() => setShowCrear(true)}
              >
                + Agregar Campo
              </button>

              <button
                className="btn btn-outline-success fw-semibold px-4 py-2 rounded-3"
                onClick={() => setMostrarModal(true)}
              >
                Solicitar Servicio
              </button>
            </div>

          </div>

          {/* Filtros / buscador */}
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-4 w-100">
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: 480, minWidth: 260, height: 38, backgroundColor: "#d1fae5" }}
              placeholder="Buscar por nombre o ubicación"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />

            <button
              className="btn btn-outline-secondary"
              style={{ height: 38 }}
              onClick={() => setFiltroTexto("")}
            >
              Limpiar
            </button>
          </div>

          {/* Grid (filas de a 4 con flex) */}
          <div className="campos-grid">
            {lista.map((campo) => (
              <div
                key={campo.id}
                className="card campos-card"
                onClick={() => navigate(`/campos/${campo.id}/lotes`)}
                role="button"
              >
                {/* Encabezado */}
                <div className="card-header bg-success text-white text-center fw-bold">
                  {campo.nombre}
                </div>

                {/* Imagen */}
                <img
                  src={campo.imagen_satelital}
                  alt={`Imagen del campo ${campo.nombre}`}
                  className="card-img-top"
                  style={{ height: 180, objectFit: "cover", borderRadius: 0 }}
                />

                {/* Localidad */}
                <div className="card-body text-dark text-center" style={{ padding: 12, background: "#eeeeeeff" }}>
                  <p className="card-text text-dark m-0" style={{ fontSize: 14 }}>
                    {campo.localidad}, {campo.provincia}
                  </p>
                </div>

                {/* Acciones */}
                <div className="card-footer d-flex justify-content-center gap-4" style={{ background: "#eeeeeeff", padding: 10 }}>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleEditar(campo); }}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(campo.id); }}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modales */}
          {mostrarModal && <SolicitarServicio onClose={() => setMostrarModal(false)} />}

          <ModalCrearCampo
            show={showCrear}
            onHide={() => setShowCrear(false)}
            onSuccess={fetchCampos}
          />

          {campoSeleccionado && (
            <ModalEditarCampo
              show={showEditar}
              onHide={() => setShowEditar(false)}
              campo={campoSeleccionado}
              onSuccess={fetchCampos}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerCampos;
