import React, { useEffect, useState } from "react";
import axios from "axios";
import "./reportes.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FaEdit, FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card } from "react-bootstrap";

import Filtros from "./Filtros";
import ModalCrearReporte from "./ModalCrearReporte";
import Anotaciones from "./Anotaciones";

const blanco = "#fff";
const API = "http://127.0.0.1:8000/api";

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

  const obtenerNombreCampo = (id) => campos.find((c) => c.id === id)?.nombre || id;
  const obtenerNombreLote = (id) => lotes.find((l) => l.id === id)?.nombre || id;
  const obtenerNombreUsuario = (id) => usuarios.find((u) => u.id === id)?.email || id;

  // === Cargar LOTE del reporte (con auth) ===
  const cargarLoteDeReporte = async (reporte) => {
    if (!reporte) { setLoteSel(null); return; }
    try {
      setCargandoLote(true);
      const idReporteLote = Number(reporte?.lote?.id ?? reporte?.lote);
      // Mejor pedir el lote específico:
      const { data } = await axios.get(`${API}/lotes/${idReporteLote}/`, { headers });
      setLoteSel(data);
    } catch (e) {
      console.error("Error al obtener el lote del reporte:", e);
      setLoteSel(null);
    } finally {
      setCargandoLote(false);
    }
  };

  useEffect(() => {
    axios.get(`${API}/usuarios/me/`, { headers })
      .then((res) => setRol(res.data.rol))
      .catch((err) => console.error(err));

    axios.get(`${API}/reportes/`, { headers })
      .then((res) => setReportes(res.data))
      .catch((err) => console.error(err));

    axios.get(`${API}/usuarios/`, { headers })
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (rol === "admin" && usuarioSeleccionado) {
      axios.get(`${API}/campos/?usuario=${usuarioSeleccionado}`, { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    } else if (rol !== "admin") {
      axios.get(`${API}/campos/`, { headers })
        .then((res) => setCampos(res.data))
        .catch((err) => console.error(err));
    }
    setCampoSeleccionado("");
    setLoteSeleccionado("");
    setLotes([]);
  }, [usuarioSeleccionado, rol]);

  useEffect(() => {
    if (nuevoReporte.campo) {
      axios.get(`${API}/lotes/por-campo/${nuevoReporte.campo}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
    }
  }, [nuevoReporte.campo]);

  useEffect(() => {
    if (campoSeleccionado) {
      axios.get(`${API}/lotes/por-campo/${campoSeleccionado}`, { headers })
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
      setLoteSeleccionado("");
    }
  }, [campoSeleccionado]);

  const handleCrearReporte = () => {
    const formData = new FormData();
    Object.entries(nuevoReporte).forEach(([key, value]) => formData.append(key, value));

    axios.post(`${API}/reportes/`, formData, {
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

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este reporte?")) {
      axios.delete(`${API}/reportes/${id}/`, { headers })
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

    if (atributoFiltro === "nombre") return filtroBase && r.nombre.toLowerCase().includes(valor);
    if (atributoFiltro === "tipo_reporte") return filtroBase && r.tipo_reporte.toLowerCase().includes(valor);
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
        day: "numeric", month: "long", year: "numeric",
      });
      return filtroBase && fecha.toLowerCase().includes(valor);
    }
    return filtroBase;
  });

  const opcionesUsuarios = usuarios.map((u) => ({ value: u.id, label: u.email }));
  const opcionesCampos = campos.map((c) => ({ value: c.id, label: c.nombre }));
  const opcionesLotes = lotes.map((l) => ({ value: l.id, label: l.nombre }));
  const opcionesFiltro = [
    { value: "nombre", label: "Nombre reporte" },
    { value: "tipo_reporte", label: "Tipo de reporte" },
    { value: "productor", label: "Usuario" },
    { value: "campo", label: "Campo" },
    { value: "fecha", label: "Fecha" },
  ];
  const customStyles = {
    control: (p, s) => ({
      ...p,
      borderColor: s.isFocused ? "#28a745" : "#ced4da",
      boxShadow: s.isFocused ? "0 0 0 1px #28a745" : "none",
      "&:hover": { borderColor: "#28a745" },
      minHeight: 38,
    }),
    option: (p, s) => ({
      ...p,
      backgroundColor: s.isSelected ? "#d4edda" : s.isFocused ? "#e9f7ef" : null,
      color: "#000",
    }),
    singleValue: (p) => ({ ...p, color: "#28a745" }),
  };

  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{ maxWidth: 1700, background: blanco, borderRadius: "1.4rem", border: "none" }}
    >
      <Card.Body className="p-4 p-sm-5">
        <div className="reportes-container">
          <h2 className="text-3xl font-bold mb-4">Reportes</h2>

          {rol === "admin" && (
            <div className="mb-4 d-flex justify-content-end">
              <button className="btn btn-success px-4 py-2 fw-semibold rounded-3" onClick={() => setShowModal(true)}>
                Agregar nuevo reporte
              </button>
            </div>
          )}

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

          <div className="reportes-layout">
            <div className="reportes-col">
              <div className="lista-reportes">
                {reportesFiltrados.length === 0 && (
                  <div className="reporte-card empty">No hay reportes con ese filtro.</div>
                )}

                {reportesFiltrados.map((r) => {
                  const fechaObj = new Date(r.fecha_reporte);
                  const dia = fechaObj.getDate().toString().padStart(2, "0");
                  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
                  const mes = meses[fechaObj.getMonth()];
                  const anio2 = fechaObj.getFullYear().toString().slice(-2);
                  const cabecera = `${dia} ${mes} ${anio2} - ${
                    r.campo_nombre || obtenerNombreCampo(r.campo)
                  } - ${r.lote_nombre || obtenerNombreLote(r.lote)} - ${r.nombre}`;

                  const isSel = reporteSel?.id === r.id;

                  return (
                    <div key={r.id} className={`reporte-card ${isSel ? "selected" : ""}`}>
                      <div className="reporte-top">
                        <span className="reporte-titulo">{cabecera}</span>
                        {rol === "admin" && (
                          <div className="reporte-actions">
                            <button className="btn btn-outline-primary btn-sm" title="Editar">
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              title="Eliminar"
                              onClick={() => handleEliminar(r.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="reporte-body">
                        <div className="reporte-meta">
                          <span className="chip">Tipo: {r.tipo_reporte}</span>
                          {r.observaciones && <span className="chip">Obs: {r.observaciones}</span>}
                          {rol === "admin" && <span className="chip">Usuario: {obtenerNombreUsuario(r.productor)}</span>}
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            className="btn btn-light ver-pdf"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReporteSel(r);
                              cargarLoteDeReporte(r);
                            }}
                          >
                            <span className="me-2"><FontAwesomeIcon icon={faLocationDot} /></span>
                            Ver anotaciones
                          </button>

                          <a
                            href={r.archivo_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-light ver-pdf"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="me-2"><FontAwesomeIcon icon={faFilePdf} /></span>
                            Ver reporte
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Anotaciones reporteSel={reporteSel} loteSel={loteSel} cargandoLote={cargandoLote} />
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
        </div>
      </Card.Body>
    </Card>
  );
};

export default Reportes;
