import React, { useCallback, useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import "./DetalleLote.css";
import { FaArrowLeft } from "react-icons/fa";

import FormSiembra from "./FormSiembra";
import FormCobertura from "./FormCobertura";
import FormCosecha from "./FormCosecha";
import HistorialCampanias from "../DetalleLote/HistorialCampanias";

const BASE = "http://127.0.0.1:8000/api";
const url = (p) => `${BASE}${p}`;

// --- Section fuera del componente para no recrearlo ---
const Section = ({ id, title, enabled, isOpen, onToggle, children }) => (
  <div className={`card p-0 mb-3 ${!enabled ? "section-disabled" : ""}`}>
    <button
      type="button"
      className={`section-header ${!enabled ? "no-toggle" : ""}`}
      onMouseDown={(e) => {
        if (e.target.closest(".section-header")) e.preventDefault();
      }}
      onClick={() => {
        if (!enabled) return;
        onToggle(isOpen ? null : id);
      }}
    >
      <span className="section-title">{title}</span>
      <span className={`arrow ${isOpen ? "open" : ""}`}>▾</span>
    </button>

    {isOpen && enabled && (
      <div
        className="p-3 pt-0 section-body"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    )}
  </div>
);

const DetalleLote = () => {
  const [estado, setEstado] = useState("barbecho"); // barbecho | cobertura | sembrado | cosechado
  const [unidadDensidad, setUnidadDensidad] = useState("Kg/Ha");
  const { loteId } = useParams();
  const [cosecha, setCosecha] = useState({ fecha: '', rinde: '', archivo: null });
  const [openSection, setOpenSection] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [semillas, setSemillas] = useState([]);
  const token = localStorage.getItem("accessToken");
  const loteNombre = location.state?.loteNombre ?? `Lote ${loteId}`;

  // Errores de validación
  const [errorsSiembra, setErrorsSiembra] = useState({});
  const [errorsCobertura, setErrorsCobertura] = useState({});
  const [errorsCosecha, setErrorsCosecha] = useState({});

  // Datos de siembra y cobertura
  const [siembra, setSiembra] = useState({
    fecha: "",
    cultivo: "",
    variedad: "",
    densidad: "",
    unidad: "Kg/Ha",
    fechaEstimadaCosecha: "",
    fechaEstimadaCosechaISO: "",
    analisisSuelo: null
  });
  const [cobertura, setCobertura] = useState({
    fecha: '',
    cultivo: '',
    variedad: '',
    densidad: ''
  });

  // Confirmar finalización campaña
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const abrirConfirmEnd = () => setShowConfirmEnd(true);
  const cerrarConfirmEnd = useCallback(() => setShowConfirmEnd(false), []);

  // Ref para scrollear al historial
  const historialRef = useRef(null);

  // Cultivos/variedades disponibles
  const cultivosDisponibles = [...new Set(semillas.map(s => s.cultivo))];
  const variedadesDisponibles = siembra.cultivo
    ? [...new Set(semillas.filter(s => s.cultivo === siembra.cultivo).map(s => s.variedad))]
    : [];

  // Habilitación por estado
  const canSiembra = estado === "barbecho" || estado === "cobertura";
  const canCobertura = estado === "barbecho";
  const canCosecha = estado === "sembrado";
  const canFinalizar = estado === "cosechado";

  // Información del campo
  const [campoInfo, setCampoInfo] = useState({
    id: location.state?.campoId ?? null,
    nombre: location.state?.campoNombre ?? "",
  });
  useEffect(() => {
    if (campoInfo.id) return;
    (async () => {
      try {
        const { data: lote } = await axios.get(url(`/lotes/${loteId}/`));
        const campoId = lote.campo;
        let campoNombre = "";
        try {
          const { data: campo } = await axios.get(url(`/campos/${campoId}/`));
          campoNombre = campo.nombre;
        } catch { }
        setCampoInfo({ id: campoId, nombre: campoNombre });
      } catch (e) {
        console.error("No pude obtener el campo del lote", e);
      }
    })();
  }, [loteId, campoInfo.id]);

  // Obtener estado del lote
  const fetchEstadoLote = async () => {
    try {
      const { data: lote } = await axios.get(url(`/lotes/${loteId}/`));
      setEstado(lote.estado);
    } catch (e) {
      console.error("No pude obtener el estado del lote", e);
    }
  };
  useEffect(() => {
    fetchEstadoLote();
  }, [loteId]);

  // Navegar atrás
  const handleBack = () => {
    if (campoInfo.id) navigate(`/campos/${campoInfo.id}/lotes`);
    else navigate("/campos");
  };

  // Plegado por tarjeta (solo una abierta a la vez)
  useEffect(() => {
    if (canSiembra) setOpenSection('siembra');
    else if (canCobertura) setOpenSection('cobertura');
    else if (canCosecha) setOpenSection('cosecha');
    else setOpenSection(null);
  }, [estado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manejo de cambios
  const handleSiembraChange = (e) => {
    const { name, value, files } = e.target;
    setSiembra((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setErrorsSiembra((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleCosechaChange = (e) => {
    const { name, value, files } = e.target;
    setCosecha((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setErrorsCosecha((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleChangeCobertura = useCallback((field, value) => {
    setCobertura((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Semillas
  useEffect(() => {
    const obtenerSemillas = async () => {
      try {
        const response = await axios.get(url(`/productos/?categoria=SEMILLAS`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSemillas(response.data);
      } catch (error) {
        console.error("Error al obtener las semillas:", error);
      }
    };
    obtenerSemillas();
  }, [token]);

  // Calcular fecha estimada de cosecha según semilla
  useEffect(() => {
    if (siembra.fecha && siembra.cultivo && siembra.variedad && semillas.length > 0) {
      const semilla = semillas.find(s => s.cultivo === siembra.cultivo && s.variedad === siembra.variedad);
      if (semilla) {
        const dias = parseInt(semilla.dias_madurez);
        if (!isNaN(dias)) {
          const fechaSiembra = new Date(siembra.fecha);
          fechaSiembra.setDate(fechaSiembra.getDate() + dias);
          setSiembra(prev => ({
            ...prev,
            fechaEstimadaCosecha: dayjs(fechaSiembra).format("DD/MM/YYYY"),
            fechaEstimadaCosechaISO: dayjs(fechaSiembra).format("YYYY-MM-DD")
          }));
        }
      }
    }
  }, [siembra.fecha, siembra.cultivo, siembra.variedad, semillas]);

  // Fecha mínima para cosecha (día después de la estimada)
  const minFechaCosechaISO = siembra.fechaEstimadaCosechaISO
    ? dayjs(siembra.fechaEstimadaCosechaISO).add(1, "day").format("YYYY-MM-DD")
    : "";

  // Ajustar fecha de cosecha si es anterior a la mínima
  useEffect(() => {
    if (!siembra.fechaEstimadaCosechaISO) return;
    const min = dayjs(siembra.fechaEstimadaCosechaISO).add(1, "day").format("YYYY-MM-DD");
    setCosecha(prev => {
      if (!prev.fecha || dayjs(prev.fecha).isBefore(min, "day")) {
        return { ...prev, fecha: min };
      }
      return prev;
    });
  }, [siembra.fechaEstimadaCosechaISO]);

  // Obtener datos de siembra y cobertura al cargar
  useEffect(() => {
    const obtenerSiembra = async () => {
      try {
        const { data } = await axios.get(url(`/siembras/por-lote/${loteId}`));
        setSiembra({
          ...data,
          fechaEstimadaCosechaISO: data.ventana_cosecha
        });
      } catch { }
    };
    obtenerSiembra();
  }, [loteId]);
  useEffect(() => {
    const obtenerCobertura = async () => {
      try {
        const res = await axios.get(url(`/coberturas/por-lote/${loteId}/`));
        setCobertura(res.data);
      } catch { }
    };
    obtenerCobertura();
  }, [loteId]);

  // Validaciones
  const validateSiembra = () => {
    const e = {};
    if (!siembra.fecha) e.fecha = "La fecha es obligatoria.";
    if (!siembra.cultivo) e.cultivo = "El cultivo es obligatorio.";
    if (!siembra.variedad) e.variedad = "La variedad es obligatoria.";
    if (!siembra.densidad) e.densidad = "La densidad es obligatoria.";
    return e;
  };
  const validateCobertura = () => {
    const e = {};
    if (!cobertura.fecha) e.fecha = "La fecha es obligatoria.";
    if (!cobertura.cultivo) e.cultivo = "El cultivo es obligatorio.";
    if (!cobertura.variedad) e.variedad = "La variedad es obligatoria.";
    if (!cobertura.densidad) e.densidad = "La densidad es obligatoria.";
    return e;
  };
  const validateCosecha = () => {
    const e = {};
    if (!cosecha.fecha) e.fecha = "La fecha es obligatoria.";
    const r = (cosecha.rinde || "").trim();
    const rindeRegex = /^\d{1,3}(,\d{1,2})?$/;
    if (!r) e.rinde = "El rinde es obligatorio.";
    else if (!rindeRegex.test(r)) e.rinde = "Formato inválido. Use n,nn (ej: 3,45).";
    if (!e.fecha && siembra.fechaEstimadaCosechaISO && cosecha.fecha) {
      const fechaC = new Date(cosecha.fecha);
      const fechaE = new Date(siembra.fechaEstimadaCosechaISO);
      if (fechaC < fechaE) e.fecha = "Debe ser posterior a la fecha estimada de cosecha.";
    }
    return e;
  };

  // Guardar cobertura, siembra y cosecha
  const guardarCobertura = async () => {
    if (estado !== "barbecho") return;
    const errs = validateCobertura();
    setErrorsCobertura(errs);
    if (Object.keys(errs).length) return;

    try {
      const payload = { ...cobertura, lote: loteId };
      if (cobertura.id) await axios.put(url(`/coberturas/${cobertura.id}/`), payload);
      else await axios.post(url(`/coberturas/`), payload);
      alert("Cobertura guardada correctamente");
      await fetchEstadoLote(); // debería quedar "cobertura"
    } catch (error) {
      console.error("Error al guardar cobertura:", error?.response?.data || error.message);
    }
  };

  const guardarSiembra = async () => {
    if (!(estado === "barbecho" || estado === "cobertura")) return;
    const errs = validateSiembra();
    setErrorsSiembra(errs);
    if (Object.keys(errs).length) return;

    const formData = new FormData();
    formData.append("fecha", siembra.fecha);
    formData.append("cultivo", siembra.cultivo);
    formData.append("variedad", siembra.variedad);
    formData.append("densidad", siembra.densidad);
    formData.append("unidad_densidad", siembra.unidad);
    formData.append("ventana_cosecha", siembra.fechaEstimadaCosechaISO || siembra.fechaEstimadaCosecha);
    formData.append("lote", loteId);
    if (siembra.analisisSuelo) formData.append("analisis_suelo", siembra.analisisSuelo);

    const endpoint = siembra.id ? `/siembras/${siembra.id}/` : `/siembras/`;
    const method = siembra.id ? "put" : "post";

    try {
      await axios({ method, url: url(endpoint), data: formData, headers: { "Content-Type": "multipart/form-data" } });
      alert("Siembra guardada correctamente");
      await fetchEstadoLote(); // debería pasar a "sembrado"
    } catch (error) {
      console.log("Backend error:", error?.response?.data || error.message);
    }
  };

  const registrarCosecha = async () => {
    if (estado !== "sembrado") return;
    const errs = validateCosecha();
    setErrorsCosecha(errs);
    if (Object.keys(errs).length) return;

    try {
      const rindeFinal = `${(cosecha.rinde || "").trim()} tn/ha`;
      const formData = new FormData();
      formData.append("fecha", cosecha.fecha);
      formData.append("rinde", rindeFinal);
      formData.append("lote", loteId);
      if (cosecha.archivo) formData.append("archivo_rendimiento", cosecha.archivo);

      await axios.post(url(`/cosechas/`), formData, { headers: { "Content-Type": "multipart/form-data" } });
      await fetchEstadoLote(); // debería pasar a "cosechado"
      alert("Cosecha registrada. El lote pasó a 'Cosechado'.");
    } catch (error) {
      console.error("Error al registrar cosecha:", error?.response?.data || error.message);
      alert(error?.response?.data?.error || "Ocurrió un error al registrar la cosecha.");
    }
  };

  // Finalizar campaña
  const finalizarCampania = async () => {
    if (estado !== "cosechado") return;
    try {
      const { data: finResp } = await axios.post(url(`/campanias/finalizar/${loteId}/`));
      setSiembra({
        fecha: "", cultivo: "", variedad: "", densidad: "",
        unidad: "Kg/Ha", fechaEstimadaCosecha: "", fechaEstimadaCosechaISO: "", analisisSuelo: null
      });
      setCosecha({ fecha: "", rinde: "", archivo: null });
      setCobertura({ fecha: '', cultivo: '', variedad: '', densidad: '' });

      if (finResp?.lote_estado) setEstado(finResp.lote_estado);
      await fetchEstadoLote(); // “barbecho”
      alert("Campaña finalizada. Lote en 'Barbecho'.");
    } catch (error) {
      console.error("Error al finalizar campaña:", error?.response?.data || error.message);
      alert(error?.response?.data?.error || "Ocurrió un error al finalizar la campaña.");
    }
  };

  // Abrir calendario al tocar un input de fecha
  const openDatePicker = (e) => {
    const input = e.currentTarget;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f0fdf4" }}>
      {/* Bread + acciones */}
      <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
        <button
          type="button"
          className="btn btn-outline-success btn-sm d-inline-flex align-items-center"
          onClick={handleBack}
          disabled={!campoInfo.id}
        >
          <FaArrowLeft className="me-2" />
          Volver
        </button>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb m-0">
            <li className="breadcrumb-item"><Link to="/campos">Campos</Link></li>
            <li className="breadcrumb-item">
              {campoInfo.id ? (
                <Link to={`/campos/${campoInfo.id}/lotes`}>{campoInfo.nombre || "Campo"}</Link>
              ) : (
                <span>{campoInfo.nombre || "Campo"}</span>
              )}
            </li>
            <li className="breadcrumb-item active" aria-current="page">{loteNombre}</li>
          </ol>
        </nav>

        <div className="ms-auto d-flex align-items-center gap-2">
          <button className="btn btn-success">Actual</button>
          <button
            className="btn btn-outline-success"
            onClick={() => {
              // Scroll suave a la sección de historial
              if (historialRef.current) {
                const el = historialRef.current;
                const y = el.getBoundingClientRect().top + window.pageYOffset - 12; // leve offset
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            Historial
          </button>
        </div>
      </div>

      {/* STACK CENTRADO */}
      <div className="lote-stack">
        {/* Estado */}
        <div className="card p-3 mb-3 text-center">
          <h5 className="fw-bold mb-2">Estado Actual del Lote</h5>

          <div className="estado-list">
            {["barbecho", "cobertura", "sembrado", "cosechado"].map((s) => (
              <span
                key={s}
                className={`estado-chip ${estado === s ? `estado-${s}` : "estado-ghost"}`}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Mensaje dinámico según el estado actual */}
          <small className="text-muted d-block mt-2">
            {{
              barbecho: 'En el estado "Barbecho" solo se pueden registrar Siembras y Coberturas.',
              cobertura: 'En el estado "Cobertura" solo se pueden registrar Siembras.',
              sembrado: 'En el estado "Sembrado" solo se pueden registrar Cosechas.',
              cosechado: 'Haz click en Finalizar Campaña para cerrar la campaña actual del lote.',
            }[estado] || 'El estado del lote se actualiza automáticamente según las acciones tomadas.'}
          </small>

        </div>

        {/* Siembra */}
        <Section id="siembra" title="Registrar Siembra" enabled={canSiembra} isOpen={openSection === 'siembra'} onToggle={setOpenSection}>
          {cultivosDisponibles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Aún no hay semillas cargadas</div>
              <p className="empty-text">
                Para registrar una siembra, primero cargá tus <strong>Semillas</strong> en la pestaña <strong>Productos</strong>.
              </p>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => navigate("/productos?categoria=SEMILLAS")}
                >
                  Ir a Productos
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.reload()}
                  title="Actualizar luego de cargar productos"
                >
                  Refrescar
                </button>
              </div>
            </div>
          ) : (
            <FormSiembra
              siembra={siembra}
              setSiembra={setSiembra}
              unidadDensidad={unidadDensidad}
              setUnidadDensidad={setUnidadDensidad}
              cultivosDisponibles={cultivosDisponibles}
              variedadesDisponibles={variedadesDisponibles}
              openDatePicker={openDatePicker}
              errorsSiembra={errorsSiembra}
              handleSiembraChange={handleSiembraChange}
              guardarSiembra={guardarSiembra}
            />
          )}
        </Section>

        {/* Cobertura */}
        <Section id="cobertura" title="Registrar Cobertura" enabled={canCobertura} isOpen={openSection === 'cobertura'} onToggle={setOpenSection}>
          {cultivosDisponibles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">Aún no hay semillas cargadas</div>
              <p className="empty-text">
                Para registrar una <strong>cobertura</strong>, primero cargá tus <strong>Semillas</strong> en la pestaña <strong>Productos</strong>.
              </p>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => navigate("/productos?categoria=SEMILLAS")}
                >
                  Ir a Productos
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.reload()}
                  title="Actualizar luego de cargar productos"
                >
                  Refrescar
                </button>
              </div>
            </div>
          ) : (
            <FormCobertura
              cobertura={cobertura}
              setCobertura={setCobertura}
              cultivosDisponibles={cultivosDisponibles}
              openDatePicker={openDatePicker}
              errorsCobertura={errorsCobertura}
              guardarCobertura={guardarCobertura}
            />
          )}
        </Section>

        {/* Cosecha */}
        <Section id="cosecha" title="Registrar Cosecha" enabled={canCosecha} isOpen={openSection === 'cosecha'} onToggle={setOpenSection}>
          <FormCosecha
            cosecha={cosecha}
            setCosecha={setCosecha}
            minFechaCosechaISO={minFechaCosechaISO}
            errorsCosecha={errorsCosecha}
            handleCosechaChange={handleCosechaChange}
            registrarCosecha={registrarCosecha}
            openDatePicker={openDatePicker}
          />
        </Section>

        {/* Finalizar campaña */}
        <div className="text-end mb-2">
          <button
            className={`btn btn-danger ${!canFinalizar ? "opacity-50" : ""}`}
            onClick={() => canFinalizar && abrirConfirmEnd()}
            disabled={!canFinalizar}
            title={!canFinalizar ? "Disponible cuando el lote está Cosechado" : ""}>
            Finalizar Campaña
          </button>
        </div>
      </div>

      {/* ===== Historial (embebido en la misma página) ===== */}
      <hr className="my-4" />
      <div ref={historialRef} id="historial-campanias">
        <HistorialCampanias
          embedded
          loteId={loteId}
          campoInfoProp={campoInfo}
          loteNombreProp={loteNombre}
        />
      </div>

      {/* Modal Confirmación Finalizar Campaña */}
      {showConfirmEnd && (
        <div
          className="confirm-overlay"
          onClick={(e) => e.target === e.currentTarget && cerrarConfirmEnd()}
        >
          <div className="confirm-card p-4">
            <h5 className="fw-bold mb-2">¿Seguro quiere Finalizar campaña?</h5>
            <p className="mb-2">
              Esta acción es irreversible: no podrás editar la siembra ni cargar nuevos datos.
            </p>
            <p className="mb-4">Los registros de la campaña pasarán al historial.</p>

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={cerrarConfirmEnd}>
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  await finalizarCampania();
                  cerrarConfirmEnd();
                }}
              >
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetalleLote;
