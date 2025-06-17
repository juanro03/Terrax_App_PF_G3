import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Campos.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import ModalCrearCampo from "./ModalCrearCampo";
import ModalEditarCampo from "./ModalEditarCampo";
import { useNavigate } from "react-router-dom";

const VerCampos = () => {
  const [campos, setCampos] = useState([]);
  const [showCrear, setShowCrear] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [campoSeleccionado, setCampoSeleccionado] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState("");
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

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este campo?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/campos/${id}/`);
        fetchCampos();
      } catch (error) {
        console.error("Error al eliminar el campo:", error);
      }
    }
  };

  const handleEditar = (campo) => {
    setCampoSeleccionado(campo);
    setShowEditar(true);
  };

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#e8fdf0",
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
            className="form-control form-control-sm"
            style={{
              height: "32px",
              backgroundColor: "#d1fae5",
              width: "450px",
              marginLeft: 100,
              marginTop: 0,
              marginBottom: 0,
              borderRadius: "8px",
              border: "1px solid #ced4da",
              padding: "6px 12px",
            }}
            placeholder="Buscar por nombre o ubicación"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
          <button
            className="btn btn-outline-secondary btn-sm"
            style={{
              height: "32px",
              borderRadius: "8px",
              padding: "6px 12px",
              border: "1px solid #ced4da",
              width: "100px",
            }}
            onClick={() => setFiltroTexto("")}
          >
            Limpiar
          </button>
        </div>

        <button
          className="btn btn-outline-success fw-bold btn-sm"
          onClick={() => setShowCrear(true)}
          style={{ height: "32px", whiteSpace: "nowrap" }}
        >
          + Agregar Campo
        </button>
      </div>

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
                  className="card m-3 p-0 shadow campo-card bg-verde"
                  style={{ width: "18rem", cursor: "pointer" }}
                  onClick={() => navigate(`/campos/${campo.id}/lotes`)}
                >
                  <div className="card-header bg-success text-white text-center fw-bold">
                    {campo.nombre}
                  </div>
                  <div className="card-body text-center">
                    <p
                      className="card-text mb-1"
                      style={{ fontSize: "15px", color: "#ffffff" }}
                    >
                      {campo.provincia}, {campo.localidad}
                    </p>
                  </div>

                  {campo.imagen_satelital && (
                    <div className="imagen-container">
                      <img
                        src={campo.imagen_satelital}
                        alt={`Imagen del campo ${campo.nombre}`}
                        className="card-img-bottom"
                        style={{
                          height: "200px",
                          objectFit: "cover",
                          borderTop: "1px solid #ccc",
                          width: "100%",
                        }}
                      />
                      <div className="botones-overlay">
                        <button
                          className="btn btn-outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditar(campo);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(campo.id);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
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
    </div>
  );
};

export default VerCampos;
