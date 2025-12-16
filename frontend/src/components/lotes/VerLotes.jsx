// src/components/lotes/VerLotes.jsx
import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Lotes.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import ModalCrearLote from "./ModalCrearLote";
import ModalEditarLote from "./ModalEditarLote";
import { Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const VerLotes = ({ campoId }) => {
  const [lotes, setLotes] = useState([]);
  const [campoNombre, setCampoNombre] = useState("");
  const [showCrear, setShowCrear] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState("");

  // 🔴 NUEVO: estado para confirmación
  const [confirmDeleteLote, setConfirmDeleteLote] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCampoNombre();
    fetchLotes();
  }, [campoId]);

  useEffect(() => {
    const handlePopState = (e) => {
      e?.preventDefault?.();
      navigate("/campos", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const fetchCampoNombre = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/campos/${campoId}/`);
      setCampoNombre(res.data?.nombre || `ID ${campoId}`);
    } catch {
      setCampoNombre(`ID ${campoId}`);
    }
  };

  const fetchLotes = async () => {
    try {
      const url = `http://127.0.0.1:8000/api/lotes/por-campo/${campoId}/`;
      const { data } = await axios.get(url);
      setLotes(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 🔴 NUEVO: función real de eliminación
  const eliminarLote = async () => {
    if (!confirmDeleteLote) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/lotes/${confirmDeleteLote}/`);
      setConfirmDeleteLote(null);
      fetchLotes();
    } catch (error) {
      console.error("Error al eliminar lote:", error);
      alert("No se pudo eliminar el lote.");
    }
  };

  const handleEditar = (lote) => {
    setLoteSeleccionado(lote);
    setShowEditar(true);
  };

  const fmtArea = (a) =>
    a === null || a === undefined ? "-" : Number(a).toFixed(2);

  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "rgb(239, 254, 238)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >

      {/* barra superior */}
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ gap: "10px", flexWrap: "wrap" }}
      >
        <div className="d-flex align-items-center flex-grow-1 flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-success btn-sm d-inline-flex align-items-center"
              onClick={() => navigate("/VerCampos")}
            >
              <FaArrowLeft className="me-2" />
              Volver
            </button>

          <h2 className="fw-bold mb-0 me-2 ms-4">{`Campo: ${campoNombre}`}</h2>

          <input
            type="text"
            className="form-control form-control-sm"
            style={{
              backgroundColor: "#ffffffff",
              width: "400px",
              marginLeft: 180,
              marginTop: 0,
              marginBottom: 0,
              border: "1px solid #3d3d3dff",
              padding: "6px 12px",
            }}
            placeholder="Buscar por nombre de lote"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>

        <button className="btn btn-outline-success" onClick={() => setShowCrear(true)}>
          + Agregar Lote
        </button>
      </div>

      {/* grid */}
      <div className="row justify-content-center">
        <div className="container mt-4">
          <div className="row">
            {lotes
              .filter((l) =>
                (l.nombre || "").toLowerCase().includes(filtroTexto.toLowerCase())
              )
              .map((lote) => (
                <div
                  key={lote.id}
                  className="card m-3 p-0 shadow"
                  style={{
                    width: "16rem",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    navigate(`/lote/${lote.id}`, {
                      state: { campoId, campoNombre, loteNombre: lote.nombre },
                    })
                  }
                >
                  {/* header */}
                  <div className="card-header bg-success text-white text-center fw-bold">
                    {lote.nombre}
                  </div>

                  <img
                    src={lote.imagen_satelital || "/img/campo.jpg"}
                    alt={`Imagen del lote ${lote.nombre}`}
                    className="card-img-top"
                    style={{
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />

                  <div className="card-body text-center">
                    <p className="card-text text-dark m-0" style={{ fontSize: "14px" }}>
                      Área: {fmtArea(lote.area)} ha
                    </p>
                  </div>

                  <div
                    className="card-footer d-flex justify-content-center gap-4"
                    style={{ backgroundColor: "#f8f9fa", padding: "10px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Editar */}
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={() => handleEditar(lote)}
                    >
                      <FaEdit />
                    </Button>

                    {/* Eliminar → abre confirmación */}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={() => setConfirmDeleteLote(lote.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* modal crear */}
      <ModalCrearLote
        show={showCrear}
        onHide={() => setShowCrear(false)}
        onSuccess={fetchLotes}
        campoId={campoId}
      />

      {/* modal editar */}
      {loteSeleccionado && (
        <ModalEditarLote
          show={showEditar}
          onHide={() => setShowEditar(false)}
          lote={loteSeleccionado}
          onSuccess={fetchLotes}
        />
      )}

      {/* 🔴 NUEVO: MODAL DE CONFIRMACIÓN DE ELIMINAR LOTE */}
      {confirmDeleteLote && (
        <div
          className="confirm-overlay"
          onClick={(e) => e.target === e.currentTarget && setConfirmDeleteLote(null)}
        >
          <div className="confirm-card p-4">
            <h5 className="fw-bold mb-2">¿Seguro que desea eliminar el lote?</h5>
            <p className="mb-2">
              Esta acción es irreversible y eliminará el lote permanentemente.
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setConfirmDeleteLote(null)}
              >
                Cancelar
              </button>

              <button className="btn btn-danger" onClick={eliminarLote}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerLotes;
