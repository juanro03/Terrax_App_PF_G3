import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Campos.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "react-bootstrap";
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
  const [campoAEliminar, setCampoAEliminar] = useState(null); // ← nuevo estado para confirmación

  const navigate = useNavigate();

  useEffect(() => {
    fetchCampos();
  }, []);

  const fetchCampos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/campos/");
      setCampos(response.data);
    } catch (error) {
      console.error("Error al obtener los campos:", error);
    }
  };

  // Ahora handleDelete SOLO abre la confirmación
  const handleDelete = (id) => {
    const campo = campos.find((c) => c.id === id);
    setCampoAEliminar(campo || null);
  };

  const confirmarEliminarCampo = async () => {
    if (!campoAEliminar) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/campos/${campoAEliminar.id}/`
      );
      await fetchCampos();
    } catch (error) {
      console.error("Error al eliminar el campo:", error);
    } finally {
      setCampoAEliminar(null);
    }
  };

  const cancelarEliminarCampo = () => {
    setCampoAEliminar(null);
  };

  const handleEditar = (campo) => {
    setCampoSeleccionado(campo);
    setShowEditar(true);
  };

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "rgb(239, 254, 238)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ gap: "10px", flexWrap: "wrap" }}
      >
        <div className="d-flex align-items-center flex-grow-1 flex-wrap gap-2">
          <h2 className="fw-bold mb-0 me-2" style={{ whiteSpace: "nowrap" }}>
            Campos Registrados
          </h2>
          <input
            type="text"
            className="form-control form-control"
            style={{
              backgroundColor: "#ffffffff",
              width: "400px",
              marginLeft: 150,
              marginTop: 0,
              marginBottom: 0,
              border: "1px solid #3d3d3dff",
              padding: "6px 12px",
            }}
            placeholder="Buscar por nombre o ubicación"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
          <button
            className="btn btn-success btn"
            style={{
              padding: "6px 12px",
              border: "1px solid #2c2c2cff",
            }}
            onClick={() => setMostrarModal(true)}
          >
            Solicitar Servicio
          </button>
        </div>

        <button
          className="btn btn-outline-success"
          onClick={() => setShowCrear(true)}
        >
          + Agregar Campo
        </button>
      </div>

      {mostrarModal && (
        <SolicitarServicio onClose={() => setMostrarModal(false)} />
      )}

      <div className="row justify-content-center">
        <div className="container mt-4">
          <div className="row">
            {campos
              .filter((campo) => {
                const texto = filtroTexto.toLowerCase();
                return (
                  campo.nombre.toLowerCase().includes(texto) ||
                  campo.localidad.toLowerCase().includes(texto) ||
                  campo.provincia.toLowerCase().includes(texto)
                );
              })
              .map((campo) => (
                <div
                  key={campo.id}
                  className="card m-3 p-0 shadow"
                  style={{
                    width: "16rem",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/campos/${campo.id}/lotes`)}
                >
                  {/* Encabezado */}
                  <div className="card-header bg-success text-white text-center fw-bold">
                    {campo.nombre}
                  </div>

                  {/* Imagen sin bordes redondeados */}
                  <img
                    src={campo.imagen_satelital}
                    alt={`Imagen del campo ${campo.nombre}`}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover", borderRadius: "0" }}
                  />

                  {/* Localidad solamente */}
                  <div
                    className="card-body text-center"
                    style={{ padding: "12px", backgroundColor: "#fff" }}
                  >
                    <p
                      className="card-text text-dark m-0"
                      style={{ fontSize: "14px" }}
                    >
                      {campo.localidad}, {campo.provincia}
                    </p>
                  </div>

                  {/* Footer con fondo gris y botones más separados */}
                  <div
                    className="card-footer d-flex justify-content-center gap-4"
                    style={{ backgroundColor: "#f8f9fa", padding: "10px" }}
                  >
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditar(campo);
                      }}
                      title="Editar"
                    >
                      <i className="bi bi-pencil" />
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(campo.id);
                      }}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

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

      {/* Confirmación Eliminar Campo */}
      {campoAEliminar && (
        <div className="confirm-overlay">
          <div className="confirm-card p-4">
            <h5 className="fw-bold mb-2">
              ¿Seguro que desea eliminar el campo "{campoAEliminar.nombre}"?
            </h5>
            <p className="mb-2">
              Esta acción es irreversible y eliminará el registro permanentemente.
            </p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={cancelarEliminarCampo}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmarEliminarCampo}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerCampos;
