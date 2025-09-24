import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./Campos.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import ModalCrearCampo from "./ModalCrearCampo";
import ModalEditarCampo from "./ModalEditarCampo";
import SolicitarServicio from "./SolicitarServicio";
import { useNavigate } from "react-router-dom";

const VerCampos = () => {
  const [campos, setCampos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);

  const [showCrear, setShowCrear] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [campoSeleccionado, setCampoSeleccionado] = useState(null);

  const navigate = useNavigate();

  /* ===== Data ===== */
  useEffect(() => {
    fetchCampos();
  }, []);

  const fetchCampos = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/campos/");
      setCampos(data || []);
    } catch (e) {
      console.error("Error al obtener los campos:", e);
    }
  };

  /* ===== Actions ===== */
  const handleEditar = (campo) => {
    setCampoSeleccionado(campo);
    setShowEditar(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Estás seguro de eliminar este campo?");
    if (!ok) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/campos/${id}/`);
      fetchCampos();
    } catch (e) {
      console.error("Error al eliminar el campo:", e);
    }
  };

  /* ===== Filtering ===== */
  const lista = campos.filter((c) => {
    const t = filtroTexto.trim().toLowerCase();
    if (!t) return true;
    return (
      c.nombre?.toLowerCase().includes(t) ||
      c.localidad?.toLowerCase().includes(t) ||
      c.provincia?.toLowerCase().includes(t)
    );
  });

  /* ===== Render ===== */
  return (
    <div className="campos-page">
      <div className="section-shell">
        <div className="p-4 p-sm-5">
          {/* Header estándar reutilizable */}
          <header className="section-header" aria-label="Cabecera de Campos">
            <h1 className="section-title">Campos Registrados</h1>

            <div className="section-search">
              <input
                className="form-control search-input"
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por nombre o ubicación"
                aria-label="Buscar campos por nombre o ubicación"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setFiltroTexto("")}
                aria-label="Limpiar búsqueda"
              >
                Limpiar
              </button>
            </div>

            <div className="section-actions">
              <button
                type="button"
                className="btn btn-outline-success fw-semibold px-3 py-2"
                onClick={() => setMostrarModalServicio(true)}
              >
                Solicitar Servicio
              </button>
              <button
                type="button"
                className="btn btn-success fw-semibold px-3 py-2"
                onClick={() => setShowCrear(true)}
              >
                + Agregar Campo
              </button>
            </div>
          </header>

          {/* Grid de tarjetas: 4 / 3 / 2 / 1 cols (responsive) */}
          <section className="card-grid" aria-label="Listado de campos">
            {lista.map((campo) => (
              <article
                key={campo.id}
                className="item-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/campos/${campo.id}/lotes`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/campos/${campo.id}/lotes`);
                }}
                aria-label={`Abrir lots del campo ${campo.nombre}`}
              >
                <div className="item-card__header">{campo.nombre}</div>

                <img
                  className="item-card__image"
                  src={campo.imagen_satelital}
                  alt={`Imagen del campo ${campo.nombre}`}
                  loading="lazy"
                />

                <div className="item-card__body">
                  {campo.localidad && campo.provincia ? (
                    <p className="m-0">
                      {campo.localidad}, {campo.provincia}
                    </p>
                  ) : (
                    <p className="m-0 text-muted">Ubicación no disponible</p>
                  )}
                </div>

                <div
                  className="item-card__footer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    title="Editar"
                    aria-label={`Editar ${campo.nombre}`}
                    onClick={() => handleEditar(campo)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    title="Eliminar"
                    aria-label={`Eliminar ${campo.nombre}`}
                    onClick={() => handleDelete(campo.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </article>
            ))}
          </section>

          {/* Modales */}
          {mostrarModalServicio && (
            <SolicitarServicio onClose={() => setMostrarModalServicio(false)} />
          )}

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
