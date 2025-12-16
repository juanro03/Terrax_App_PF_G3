import React, { useEffect, useState } from "react";
import axios from "axios";
import "./reportes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "react-bootstrap";

import {
  Card,
} from "react-bootstrap";
import Filtros from "./Filtros";
import ModalCrearReporte from "./ModalCrearReporte";
import ModalEditarReporte from "./ModalEditarReporte";
import Anotaciones from "./Anotaciones";

const API = "http://127.0.0.1:8000/api";
const TX_GREEN = "#198754";

const Reportes = () => {
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [campoSeleccionado, setCampoSeleccionado] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState("");
  const [rol, setRol] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reporteAEditar, setReporteAEditar] = useState(null);
  const [nuevoReporte, setNuevoReporte] = useState({
    productor: "",
    campo: "",
    lote: "",
    nombre: "",
    tipo_reporte: "",
    observaciones: "",
    archivo_pdf: null,
    fecha_reporte: "",
  });
  const [atributoFiltro, setAtributoFiltro] = useState("nombre");
  const [valorBusqueda, setValorBusqueda] = useState("");
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const [reporteSel, setReporteSel] = useState(null);
  const [loteSel, setLoteSel] = useState(null);
  const [cargandoLote, setCargandoLote] = useState(false);
  const obtenerNombreCampo = (id) =>
    campos.find((c) => c.id === id)?.nombre || id;
  const obtenerNombreLote = (id) =>
    lotes.find((l) => l.id === id)?.nombre || id;
  const obtenerNombreUsuario = (id) =>
    usuarios.find((u) => u.id === id)?.email || id;

  const cargarLoteDeReporte = async (reporte) => {
    if (!reporte) {
      setLoteSel(null);
      return;
    }
    try {
      setCargandoLote(true);
      const idReporteLote = Number(reporte?.lote?.id ?? reporte?.lote);
      const { data } = await axios.get(`${API}/lotes/${idReporteLote}/`, {
        headers,
      });
      setLoteSel(data);
    } catch (e) {
      console.error("Error al obtener el lote del reporte:", e);
      setLoteSel(null);
    } finally {
      setCargandoLote(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    axios
      .get(`${API}/usuarios/me/`, { headers })
      .then((res) => setRol(res.data.rol))
      .catch((err) => console.error(err));

    axios
      .get(`${API}/reportes/`, { headers })
      .then((res) => setReportes(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`${API}/usuarios/`, { headers })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Campos por usuario (admin) o todos (no admin)
  useEffect(() => {
    if (rol === "admin" && usuarioSeleccionado) {
      axios
        .get(`${API}/campos/?usuario=${usuarioSeleccionado}`, { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    } else if (rol !== "admin") {
      axios
        .get(`${API}/campos/`, { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    }
    setCampoSeleccionado("");
    setLoteSeleccionado("");
    setLotes([]);
  }, [usuarioSeleccionado, rol]);

  // Lotes por campo (filtros)
  useEffect(() => {
    if (campoSeleccionado) {
      axios
        .get(`${API}/lotes/por-campo/${campoSeleccionado}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
      setLoteSeleccionado("");
    }
  }, [campoSeleccionado]);

  // Lotes para modal crear (campo en nuevoReporte)
  useEffect(() => {
    if (nuevoReporte.campo) {
      axios
        .get(`${API}/lotes/por-campo/${nuevoReporte.campo}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
    }
  }, [nuevoReporte.campo]);

  const handleCrearReporte = () => {
    const formData = new FormData();
    Object.entries(nuevoReporte).forEach(([key, value]) =>
      formData.append(key, value)
    );

    axios
      .post(`${API}/reportes/`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setReportes((prev) => [...prev, res.data]);
        setShowModal(false);
        setNuevoReporte({
          productor: "",
          campo: "",
          lote: "",
          nombre: "",
          tipo_reporte: "",
          observaciones: "",
          archivo_pdf: null,
          fecha_reporte: "",
        });
      })
      .catch((err) => console.error(err));
  };

  const handleEditarClick = (e, reporte) => {
    e.stopPropagation();
    // Aseguramos que los campos relacionados sean solo IDs
    const reporteParaEditar = {
      ...reporte,
      productor: reporte.productor,
      campo: reporte.campo,
      lote: reporte.lote,
    };
    setReporteAEditar(reporteParaEditar);
    setShowEditModal(true);
  };

  const handleUpdateReporte = (datosActualizados) => {
    const formData = new FormData();
    Object.entries(datosActualizados).forEach(([key, value]) => {
      // Si el archivo no es una instancia de File, es la URL antigua, no la enviamos.
      if (key === "archivo_pdf" && !(value instanceof File)) return;
      formData.append(key, value);
    });

    axios
      .patch(`${API}/reportes/${reporteAEditar.id}/`, formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setReportes((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
        if (reporteSel?.id === res.data.id) setReporteSel(res.data);
        setShowEditModal(false);
        setReporteAEditar(null);
      })
      .catch((err) => console.error("Error al actualizar el reporte:", err));
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
      axios
        .delete(`${API}/reportes/${id}/`, { headers })
        .then(() => {
          setReportes((prev) => prev.filter((r) => r.id !== id));
          if (reporteSel?.id === id) {
            setReporteSel(null);
            setLoteSel(null);
          }
        })
        .catch((err) => {
          console.error("Error al eliminar el reporte:", err);
          alert("Hubo un error al eliminar el reporte.");
        });
    }
  };

  const reportesFiltrados = reportes.filter((r) => {
    const filtroBase =
      (!usuarioSeleccionado || r.productor === parseInt(usuarioSeleccionado)) &&
      (!campoSeleccionado || r.campo === parseInt(campoSeleccionado)) &&
      (!loteSeleccionado || r.lote === parseInt(loteSeleccionado));

    const valor = valorBusqueda.toLowerCase();
    if (!valor) return filtroBase;

    if (atributoFiltro === "nombre")
      return filtroBase && r.nombre.toLowerCase().includes(valor);
    if (atributoFiltro === "tipo_reporte")
      return filtroBase && r.tipo_reporte.toLowerCase().includes(valor);
    if (atributoFiltro === "productor") {
      const usuario = usuarios.find((u) => u.id === r.productor);
      return filtroBase && usuario?.email?.toLowerCase().includes(valor);
    }
    if (atributoFiltro === "campo") {
      const campo = campos.find((c) => c.id === r.campo);
      return filtroBase && campo?.nombre?.toLowerCase().includes(valor);
    }
    if (atributoFiltro === "fecha") {
      const fecha = new Date(r.fecha_reporte).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return filtroBase && fecha.toLowerCase().includes(valor);
    }
    return filtroBase;
  });

  const opcionesUsuarios = usuarios.map((u) => ({
    value: u.id,
    label: u.email,
  }));
  const opcionesCampos = campos.map((c) => ({ value: c.id, label: c.nombre }));
  const opcionesLotes = lotes.map((l) => ({ value: l.id, label: l.nombre }));
  const opcionesFiltro = [
    { value: "nombre", label: "Nombre reporte" },
    { value: "tipo_reporte", label: "Tipo de reporte" },
    { value: "productor", label: "Usuario" },
    { value: "campo", label: "Campo" },
    { value: "fecha", label: "Fecha" },
  ];

  // Estilos para react-select dentro de <Filtros />
  const customStyles = {
    control: (p, s) => ({
      ...p,
      borderColor: s.isFocused ? TX_GREEN : "#ced4da",
      boxShadow: s.isFocused ? `0 0 0 1px ${TX_GREEN}` : "none",
      "&:hover": { borderColor: TX_GREEN },
      minHeight: 40,
      borderRadius: 8, // cuadrados suaves
      width: "100%",
    }),
    container: (p) => ({ ...p, width: "100%" }), // fuerza 100% ancho
    option: (p, s) => ({
      ...p,
      backgroundColor: s.isSelected
        ? "#dff3e6"
        : s.isFocused
          ? "#edf8f1"
          : null,
      color: "#111827",
    }),
    singleValue: (p) => ({ ...p, color: TX_GREEN }),
    dropdownIndicator: (p) => ({ ...p, color: TX_GREEN }),
    menu: (p) => ({ ...p, zIndex: 5 }),
  };

  // Si los filtros cambian y ya no existe el reporte seleccionado,
  // lo deseleccionamos para que Anotaciones quede vacío
  useEffect(() => {
    if (!reporteSel) return;

    // ¿El reporte seleccionado sigue estando en la lista filtrada?
    const sigueExistiendo = reportesFiltrados.some(r => r.id === reporteSel.id);

    if (!sigueExistiendo) {
      setReporteSel(null);
      setLoteSel(null);
    }
  }, [reportesFiltrados]);

  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{
        maxWidth: 1200,
        padding: "2rem",
        margin: "3rem",
        background: "#fff",
        borderRadius: "1.4rem",
        transform: "none",
        transition: "none"
      }}
    >
      {/* wrapper para que selects/inputs ocupen el mismo ancho que la tarjeta */}
      <div className="reportes-container" style={{ width: "100%" }}>
        <h2 className="terrax-title">Reportes</h2>

        {rol === "admin" && (
          <div
            className="mb-3 d-flex justify-content-end"
            style={{ width: "100%" }}
          >
            <div style={{ textAlign: "center", width: "100%" }}>
              <button className="btn-terrax" onClick={() => setShowModal(true)}>
                Agregar nuevo reporte
              </button>
            </div>

          </div>
        )}

        {/* Filtros con selects al 100% del ancho disponible */}
        <div className="filtros-container" style={{ width: "100%" }}>
          <Filtros
            rol={rol}
            opcionesUsuarios={opcionesUsuarios}
            opcionesCampos={opcionesCampos}
            opcionesLotes={opcionesLotes}
            opcionesFiltro={opcionesFiltro}
            customStyles={customStyles}
            usuarioSeleccionado={usuarioSeleccionado}
            campoSeleccionado={campoSeleccionado}
            loteSeleccionado={loteSeleccionado}
            atributoFiltro={atributoFiltro}
            valorBusqueda={valorBusqueda}
            setUsuarioSeleccionado={setUsuarioSeleccionado}
            setCampoSeleccionado={setCampoSeleccionado}
            setLoteSeleccionado={setLoteSeleccionado}
            setAtributoFiltro={setAtributoFiltro}
            setValorBusqueda={setValorBusqueda}
          />
        </div>

        <div className="reportes-layout">
          <div className="reportes-col">
            <div
              className="lista-reportes"
              role="list"
              aria-label="Listado de reportes"
            >
              {reportesFiltrados.length === 0 && (
                <div
                  className="reporte-card empty"
                  role="status"
                  aria-live="polite"
                >
                  No hay reportes con ese filtro.
                </div>
              )}

              {reportesFiltrados.map((r) => {
                const fechaObj = new Date(r.fecha_reporte);
                const dia = fechaObj.getDate().toString().padStart(2, "0");
                const meses = [
                  "ENE",
                  "FEB",
                  "MAR",
                  "ABR",
                  "MAY",
                  "JUN",
                  "JUL",
                  "AGO",
                  "SEP",
                  "OCT",
                  "NOV",
                  "DIC",
                ];
                const mes = meses[fechaObj.getMonth()];
                const anio2 = fechaObj.getFullYear().toString().slice(-2);
                const cabecera = `${dia} ${mes} ${anio2} - ${r.campo_nombre || obtenerNombreCampo(r.campo)
                  } - ${r.lote_nombre || obtenerNombreLote(r.lote)} - ${r.nombre
                  }`;

                const isSel = reporteSel?.id === r.id;

                return (
                  <div
                    key={r.id}
                    className={`reporte-card ${isSel ? "selected" : ""}`}
                    role="listitem"
                    onClick={() => {
                      setReporteSel(r);
                      cargarLoteDeReporte(r);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="reporte-top">
                      <span className="reporte-titulo">{cabecera}</span>

                      {rol === "admin" && (
                        <div className="reporte-actions">
                          <button
                            className="btn-round-outline"
                            title="Editar"
                            onClick={(e) => handleEditarClick(e, r)}
                          >
                            <i className="bi bi-pencil" />
                          </button>

                          <button
                            className="btn-round-outline"
                            title="Eliminar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminar(r.id);
                            }}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>



                      )}
                    </div>

                    <div className="reporte-body">
                      <div className="reporte-meta">
                        <span className="chip">Tipo: {r.tipo_reporte}</span>
                        {r.observaciones && (
                          <span className="chip">Obs: {r.observaciones}</span>
                        )}
                        {rol === "admin" && (
                          <span className="chip">
                            Usuario: {obtenerNombreUsuario(r.productor)}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="btn-light-terrax"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReporteSel(r);
                            cargarLoteDeReporte(r);
                          }}
                        >
                          <span className="me-2">
                            <FontAwesomeIcon icon={faLocationDot} />
                          </span>
                          Ver anotaciones
                        </button>

                        <a
                          href={r.archivo_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-light-terrax"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="me-2">
                            <FontAwesomeIcon icon={faFilePdf} />
                          </span>
                          Ver reporte
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Anotaciones
            reporteSel={reporteSel}
            loteSel={loteSel}
            cargandoLote={cargandoLote}
          />
        </div>

        <ModalCrearReporte
          show={showModal}
          onClose={() => setShowModal(false)}
          onCrear={handleCrearReporte}
          nuevoReporte={nuevoReporte}
          setNuevoReporte={setNuevoReporte}
          usuarios={usuarios}
          campos={campos}
          lotes={lotes}
        />

        {reporteAEditar && (
          <ModalEditarReporte
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleUpdateReporte}
            reporteAEditar={reporteAEditar}
            usuarios={usuarios}
            campos={campos}
          />
        )}
      </div>
    </Card>
  );
};

export default Reportes;
