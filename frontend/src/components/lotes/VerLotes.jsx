import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import { FaPen, FaTrash } from "react-icons/fa";
import ModalCrearLote from "./ModalCrearLote";
import ModalEditarLote from "./ModalEditarLote";
import "./Lotes.css";
import { Link } from "react-router-dom";


const VerLotes = ({ campoId }) => {
  const [lotes, setLotes] = useState([]);
  const [campoNombre, setCampoNombre] = useState(""); // ✅ nuevo estado
  const [showCrear, setShowCrear] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);

  useEffect(() => {
    fetchLotes();
    fetchCampoNombre();
  }, [campoId]);

  const fetchCampoNombre = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/campos/${campoId}/`);
      setCampoNombre(res.data.nombre); // ✅ campo.nombre esperado desde backend
    } catch (error) {
      console.error("Error al obtener el nombre del campo:", error);
      setCampoNombre(`ID ${campoId}`);
    }
  };

  const fetchLotes = async () => {
    try {
      const url = `http://127.0.0.1:8000/api/lotes/por-campo/${campoId}/`;
      const response = await axios.get(url);
      setLotes(response.data);
    } catch (error) {
      console.error("Error al obtener los lotes:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este lote?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/lotes/${id}/`);
        fetchLotes();
      } catch (error) {
        console.error("Error al eliminar el lote:", error);
      }
    }
  };

  const handleEditar = (lote) => {
    setLoteSeleccionado(lote);
    setShowEditar(true);
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: "#e8fdf0", minHeight: "100vh", padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 fw-bold" style={{ color: "#025940" }}>
          Campo: {campoNombre}
        </h2>
        <button className="btn btn-outline-success" onClick={() => setShowCrear(true)}>
          + Agregar Lote
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="container mt-4">
          <div className="row">
            {lotes.map((lote) => (
              <Link
                key={lote.id}
                to={`/lote/${lote.id}`}
                className="card m-3 p-0 shadow text-decoration-none"
                style={{ width: "18rem", cursor: "pointer", color: "inherit" }}
              >
                <div className="card-header bg-success text-white text-center fw-bold">
                  <div className="card-body">
                    <h5>{lote.nombre}</h5>
                    <p className="card-text">
                      Área: {lote.area} ha
                    </p>
                    <div className="d-flex justify-content-around mt-2">
                      <button className="btn btn-outline-primary" onClick={() => handleEditar(lote)}>
                        <FaPen />
                      </button>

                      <button className="btn btn-outline-danger" onClick={() => handleDelete(lote.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {lote.imagen_satelital && (
                    <div className="imagen-lote-wrapper">
                      <img
                        src={lote.imagen_satelital}
                        alt={`Imagen del lote ${lote.nombre}`}
                        className="imagen-lote"
                      />
                      <div className="overlay-lote"></div>
                        <div className="iconos-flotantes-verticales">
                          <FaPen
                            className="icono-lote"
                            onClick={() => handleEditar(lote)}
                            title="Editar"
                          />
                          <FaTrash
                            className="icono-lote eliminar"
                            onClick={() => handleDelete(lote.id)}
                            title="Eliminar"
                          />
                        </div>
                    </div>
                  )}

                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ModalCrearLote show={showCrear} onHide={() => setShowCrear(false)} onSuccess={fetchLotes} campoId={campoId} />

      {loteSeleccionado && (
        <ModalEditarLote
          show={showEditar}
          onHide={() => setShowEditar(false)}
          lote={loteSeleccionado}
          onSuccess={fetchLotes}
        />
      )}
    </div>
  );
};

export default VerLotes;
