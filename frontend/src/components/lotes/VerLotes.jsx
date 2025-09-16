// src/components/lotes/VerLotes.jsx
import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Lotes.css";
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

  // Si vuelven con el botón “atrás”, redirige a /campos
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
      console.error("Error al obtener los lotes:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este lote?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/lotes/${id}/`);
      fetchLotes();
    } catch (error) {
      console.error("Error al eliminar el lote:", error);
    }
  };

  const handleEditar = (lote) => {
    setLoteSeleccionado(lote);
    setShowEditar(true);
  };

  const fmtArea = (a) =>
    a === null || a === undefined || isNaN(Number(a)) ? "-" : Number(a).toFixed(2);

  const lista = lotes.filter((l) =>
    (l.nombre || "").toLowerCase().includes(filtroTexto.toLowerCase())
  );

  return (
    <div className="lotes-page">
      <div className="mx-auto my-5 shadow lotes-shell">
        <div className="p-4 p-sm-5">
          {/* Título */}
          <h2 className="text-3xl fw-bold mb-3 text-center">
            Lotes: {campoNombre}
          </h2>

          {/* Botón Agregar */}
          <div className="text-center mb-3">
            <button
              className="btn btn-success fw-semibold px-4 py-2 rounded-3"
              onClick={() => setShowCrear(true)}
            >
              + Agregar Lote
            </button>
          </div>

          {/* Buscador */}
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-4 w-100">
            <input
              type="text"
              className="form-control"
              style={{ maxWidth: 480, minWidth: 260, height: 38, backgroundColor: "#d1fae5" }}
              placeholder="Buscar por nombre de lote"
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

          {/* Grid de tarjetas (flex / 4 por fila) */}
          <div className="lotes-grid">
            {lista.map((lote) => (
              <div
                key={lote.id}
                className="card lotes-card"
                role="button"
                onClick={() =>
                  navigate(`/lote/${lote.id}`, {
                    state: { campoId, campoNombre, loteNombre: lote.nombre },
                  })
                }
              >
                {/* Encabezado */}
                <div className="card-header bg-success text-white text-center fw-bold">
                  {lote.nombre}
                </div>

                {/* Imagen */}
                <img
                  src={lote.imagen_satelital || "/img/campo.jpg"}
                  alt={`Imagen del lote ${lote.nombre}`}
                  className="card-img-top"
                  style={{ height: 180, objectFit: "cover", borderRadius: 0 }}
                />

                {/* Info */}
                <div className="card-body text-center" style={{ padding: 12, background: "#eeeeeeff" }}>
                  <p className="card-text text-dark m-0" style={{ fontSize: 14 }}>
                    Área: {fmtArea(lote.area)} ha
                  </p>
                </div>

                {/* Acciones (evitar propagación) */}
                <div
                  className="card-footer d-flex justify-content-center gap-4"
                  style={{ background: "#eeeeeeff", padding: 10 }}
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

          {/* Modales */}
          <ModalCrearLote
            show={showCrear}
            onHide={() => setShowCrear(false)}
            onSuccess={fetchLotes}
            campoId={campoId}
          />

          {loteSeleccionado && (
            <ModalEditarLote
              show={showEditar}
              onHide={() => setShowEditar(false)}
              lote={loteSeleccionado}
              onSuccess={fetchLotes}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerLotes;
