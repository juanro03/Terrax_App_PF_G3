// src/components/lotes/VerLotes.jsx
import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Lotes.css"; // reutilizamos el mismo look
import { FaEdit, FaTrash } from "react-icons/fa";
import ModalCrearLote from "./ModalCrearLote";
import ModalEditarLote from "./ModalEditarLote";
import { useNavigate } from "react-router-dom";

const VerLotes = ({ campoId }) => {
  const [lotes, setLotes] = useState([]);
  const [campoNombre, setCampoNombre] = useState("");
  const [showCrear, setShowCrear] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCampoNombre();
    fetchLotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (error) {
      console.error("Error al obtener el nombre del campo:", error);
      setCampoNombre(`ID ${campoId}`);
    }
  };

  const fetchLotes = async () => {
    try {
      // ajustá si tu endpoint es otro (por-campo o query param)
      const url = `http://127.0.0.1:8000/api/lotes/por-campo/${campoId}/`;
      const { data } = await axios.get(url);
      setLotes(data || []);
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
      {/* barra superior (idéntica a VerCampos) */}
      <div
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ gap: "10px", flexWrap: "wrap" }}
      >
        <div className="d-flex align-items-center flex-grow-1 flex-wrap gap-2">
          <h2 className="fw-bold mb-0 me-2" style={{ whiteSpace: "nowrap" }}>
            {`Campo: ${campoNombre}`}
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
            placeholder="Buscar por nombre de lote"
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

        <button className="btn btn-outline-success" onClick={() => setShowCrear(true)}>
          + Agregar Lote
        </button>
      </div>

      {/* grid de tarjetas (misma card que VerCampos) */}
      <div className="row justify-content-center">
        <div className="container mt-4">
          <div className="row">
            {lotes
              .filter((l) =>
                (l.nombre || "")
                  .toLowerCase()
                  .includes(filtroTexto.toLowerCase())
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
                      state: {
                        campoId,           // el id del campo actual
                        campoNombre,       // el nombre del campo (si lo tenés)
                        loteNombre: lote.nombre,
                      },
                    })
                  }
                >
                  {/* header */}
                  <div className="card-header bg-success text-white text-center fw-bold">
                    {lote.nombre}
                  </div>

                  {/* imagen */}
                  <img
                    src={
                      lote.imagen_satelital ||
                      "/img/campo.jpg" /* placeholder si no hay imagen */
                    }
                    alt={`Imagen del lote ${lote.nombre}`}
                    className="card-img-top"
                    style={{
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "0",
                    }}
                  />

                  {/* body (info) */}
                  <div
                    className="card-body text-center"
                    style={{ padding: "12px", backgroundColor: "#fff" }}
                  >
                    <p
                      className="card-text text-dark m-0"
                      style={{ fontSize: "14px" }}
                    >
                      Área: {fmtArea(lote.area)} ha
                    </p>
                  </div>

                  {/* footer con acciones, detiene propagación para no navegar */}
                  <div
                    className="card-footer d-flex justify-content-center gap-4"
                    style={{ backgroundColor: "#f8f9fa", padding: "10px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleEditar(lote)}
                      title="Editar / Ver"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(lote.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
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

      {/* modal editar (si lo usás) */}
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
