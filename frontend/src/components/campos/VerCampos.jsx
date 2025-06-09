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
    <div className="container-fluid" style={{ backgroundColor: "#e8fdf0", minHeight: "100vh", padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 fw-bold">Campos Registrados</h2>
        <button className="btn btn-outline-success" onClick={() => setShowCrear(true)}>
          + Agregar Campo
        </button>
      </div>
      <div className="row justify-content-center">
        <div className="container mt-4">
          <div className="row">
            {campos.map((campo) => (
              <div
                key={campo.id}
                className="card m-3 p-0 shadow"
                style={{ width: "18rem", cursor: "pointer" }}
              >
                <div
                  className="card-header bg-success text-white text-center fw-bold"
                  onClick={() => navigate(`/campos/${campo.id}/lotes`)}
                >
                  <div className="card-body">
                    <h5>Campo {campo.nombre}</h5>
                    <p className="card-text">
                      {campo.provincia}, {campo.localidad}
                    </p>
                    <div className="d-flex justify-content-around mt-2">
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

                  {campo.imagen_satelital && (
                    <img
                      src={campo.imagen_satelital}
                      alt={`Imagen del campo ${campo.nombre}`}
                      className="card-img-bottom"
                      style={{ height: "200px", objectFit: "cover", borderTop: "1px solid #ccc" }}
                    />
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      <ModalCrearCampo show={showCrear} onHide={() => setShowCrear(false)} onSuccess={fetchCampos} />

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