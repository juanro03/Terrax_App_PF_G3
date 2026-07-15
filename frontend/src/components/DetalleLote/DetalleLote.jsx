import React, { useCallback, useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "./DetalleLote.css";
import { FaArrowLeft } from "react-icons/fa";
import SuccessAlert from "../common/SuccessAlert.jsx";
import FormSiembra from "./FormSiembra";
import FormCobertura from "./FormCobertura";
import FormCosecha from "./FormCosecha";
import HistorialCampanias from "../DetalleLote/HistorialCampanias";

const BASE = "http://127.0.0.1:8000/api";
const url = (p) => `${BASE}${p}`;

// --- Section (acordeón) ---
const Section = ({
  id,
  title,
  enabled,
  isOpen,
  onToggle,
  children,
  actions,
}) => (
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
      <div className="d-flex w-100 justify-content-between align-items-center">
        <span className="section-title">{title}</span>
        <div className="d-flex align-items-center gap-2">
          {actions}
          <span className={`arrow ${isOpen ? "open" : ""}`}>▾</span>
        </div>
      </div>
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
  const [estado, setEstado] = useState("barbecho");
  const [unidadDensidad, setUnidadDensidad] = useState("Kg/Ha");
  const { loteId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const loteNombre = location.state?.loteNombre ?? `Lote ${loteId}`;
  const [showSuccess, setShowSuccess] = useState(null);

  // Datos + snapshots para cancelación
  const [siembra, setSiembra] = useState({
    id: null,
    fecha: "",
    cultivo: "",
    variedad: "",
    densidad: "",
    unidad: "Kg/Ha",
    fechaEstimadaCosecha: "",
    fechaEstimadaCosechaISO: "",
    analisisSuelo: null,
  });
  const [originalSiembra, setOriginalSiembra] = useState(null);

  const [cobertura, setCobertura] = useState({
    id: null,
    fecha: "",
    cultivo: "",
    variedad: "",
    densidad: "",
  });
  const [originalCobertura, setOriginalCobertura] = useState(null);

  const [cosecha, setCosecha] = useState({
    id: null,
    fecha: "",
    rinde: "",
    archivo: null,
  });
  const [originalCosecha, setOriginalCosecha] = useState(null);

  // Flags de edición
  const [isEditingSiembra, setIsEditingSiembra] = useState(false);
  const [isEditingCobertura, setIsEditingCobertura] = useState(false);
  const [isEditingCosecha, setIsEditingCosecha] = useState(false);

  // Errores
  const [errorsSiembra, setErrorsSiembra] = useState({});
  const [errorsCobertura, setErrorsCobertura] = useState({});
  const [errorsCosecha, setErrorsCosecha] = useState({});
  const [errorRinde, setErrorRinde] = useState("");
  const [errorDensidad, setErrorDensidad] = useState("");
  const [errorDensidadCobertura, setErrorDensidadCobertura] = useState("");

  const [semillas, setSemillas] = useState([]);
  const [openSection, setOpenSection] = useState("siembra");

  // Confirmar finalización campaña
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const abrirConfirmEnd = () => setShowConfirmEnd(true);
  const cerrarConfirmEnd = useCallback(() => setShowConfirmEnd(false), []);

  // Ref para historial
  const historialRef = useRef(null);

  // Campo info
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

  // Estado del lote
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

  const cultivosDisponibles = [...new Set(semillas.map((s) => s.cultivo))];
  const variedadesDisponibles = siembra.cultivo
    ? [
      ...new Set(
        semillas
          .filter((s) => s.cultivo === siembra.cultivo)
          .map((s) => s.variedad)
      ),
    ]
    : [];

    const variedadesCobertura = cobertura.cultivo
  ? [
      ...new Set(
        semillas
          .filter((s) => s.cultivo === cobertura.cultivo)
          .map((s) => s.variedad)
      ),
    ]
  : [];

  // Cambios en formularios
  const handleSiembraChange = (e) => {
    const { name, value, files } = e.target;
    setSiembra((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setErrorsSiembra((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleChangeCobertura = (field, value) => {
    setCobertura((prev) => ({ ...prev, [field]: value }));
    setErrorsCobertura((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCosechaChange = (e) => {
    const { name, value, files } = e.target;
    setCosecha((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    setErrorsCosecha((prev) => ({ ...prev, [name]: undefined }));
  };

  // Calcular fecha estimada de cosecha
  useEffect(() => {
    if (siembra.modoCultivoLibre) {
      if (siembra.fecha && siembra.dias_madurez_manual) {
        const dias = parseInt(siembra.dias_madurez_manual);
        if (!isNaN(dias)) {
          const fechaSiembra = new Date(siembra.fecha);
          fechaSiembra.setDate(fechaSiembra.getDate() + dias);
          setSiembra((prev) => ({
            ...prev,
            fechaEstimadaCosecha: dayjs(fechaSiembra).format("DD/MM/YYYY"),
            fechaEstimadaCosechaISO: dayjs(fechaSiembra).format("YYYY-MM-DD"),
          }));
        }
      }
      return;
    }

    if (siembra.fecha && siembra.cultivo && siembra.variedad && semillas.length) {
      const semilla = semillas.find(
        (s) => s.cultivo === siembra.cultivo && s.variedad === siembra.variedad
      );
      if (semilla) {
        const dias = parseInt(semilla.dias_madurez);
        if (!isNaN(dias)) {
          const fechaSiembra = new Date(siembra.fecha);
          fechaSiembra.setDate(fechaSiembra.getDate() + dias);
          setSiembra((prev) => ({
            ...prev,
            fechaEstimadaCosecha: dayjs(fechaSiembra).format("DD/MM/YYYY"),
            fechaEstimadaCosechaISO: dayjs(fechaSiembra).format("YYYY-MM-DD"),
          }));
        }
      }
    }
  }, [
    siembra.fecha,
    siembra.cultivo,
    siembra.variedad,
    siembra.dias_madurez_manual,
    siembra.modoCultivoLibre,
    semillas,
  ]);

  const minFechaCosechaISO = siembra.fechaEstimadaCosechaISO
    ? dayjs(siembra.fechaEstimadaCosechaISO).add(1, "day").format("YYYY-MM-DD")
    : "";

  // Inicializar fecha de cosecha por defecto UNA vez
  useEffect(() => {
    if (!siembra.fechaEstimadaCosechaISO) return;
    setCosecha((prev) => {
      if (!prev.fecha) {
        return { ...prev, fecha: siembra.fechaEstimadaCosechaISO };
      }
      return prev;
    });
  }, [siembra.fechaEstimadaCosechaISO]);

  // Obtener siembra / cobertura / cosecha inicial
  useEffect(() => {
    const obtenerSiembra = async () => {
      try {
        const { data } = await axios.get(url(`/siembras/por-lote/${loteId}`));
        const nuevo = {
          ...siembra,
          ...data,
          id: data.id,
          fechaEstimadaCosechaISO: data.ventana_cosecha,
        };
        setSiembra(nuevo);
        setOriginalSiembra(nuevo);
      } catch { }
    };
    obtenerSiembra();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId]);

  useEffect(() => {
    const obtenerCobertura = async () => {
      try {
        const { data } = await axios.get(url(`/coberturas/por-lote/${loteId}/`));
        const nuevo = { ...cobertura, ...data, id: data.id };
        setCobertura(nuevo);
        setOriginalCobertura(nuevo);
      } catch { }
    };
    obtenerCobertura();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loteId]);

  useEffect(() => {
    const obtenerCosecha = async () => {
      try {
        const { data } = await axios.get(url(`/cosechas/?lote=${loteId}`));
        if (Array.isArray(data) && data.length > 0) {
          const ultima = data[data.length - 1];
          const nuevo = {
            id: ultima.id,
            fecha: ultima.fecha,
            rinde: ultima.rinde,
            archivo: null,
          };
          setCosecha(nuevo);
          setOriginalCosecha(nuevo);
        }
      } catch { }
    };
    obtenerCosecha();
  }, [loteId]);

  // === EXISTENCIA DE REGISTROS ===
  const hasSiembra = !!siembra.id;
  const hasCobertura = !!cobertura.id;
  const hasCosecha = !!cosecha.id;

  // === PERMISOS PARA REGISTRAR SEGÚN ESTADO ===
  let canRegisterSiembra = false;
  let canRegisterCobertura = false;
  let canRegisterCosecha = false;

  switch (estado) {
    case "barbecho":
      if (!hasSiembra) canRegisterSiembra = true;
      if (!hasCobertura) canRegisterCobertura = true;
      break;

    case "cobertura":
      if (!hasSiembra) canRegisterSiembra = true;
      // NO permite registrar cobertura
      break;

    case "sembrado":
      if (!hasCosecha) canRegisterCosecha = true;
      // NO permite siembra ni cobertura
      break;

    case "cosechado":
    default:
      // No se permite registrar nada
      break;
  }


  const canEditSiembra = hasSiembra;
  const canEditCobertura = hasCobertura;
  const canEditCosecha = hasCosecha;

  const siembraEnabled = canRegisterSiembra || canEditSiembra;
  const coberturaEnabled = canRegisterCobertura || canEditCobertura;
  const cosechaEnabled = canRegisterCosecha || canEditCosecha;

  useEffect(() => {
    if (estado === "barbecho" || estado === "cobertura") {
      setOpenSection("siembra");
    } else if (estado === "sembrado" || estado === "cosechado") {
      setOpenSection("cosecha");
    } else {
      setOpenSection("siembra");
    }
  }, [estado]);

  // === VALIDACIONES ===
  const validateSiembra = () => {
    const e = {};
    if (siembra.modoCultivoLibre) {
      if (!siembra.cultivo) e.cultivo = "El cultivo es obligatorio.";
      if (!siembra.variedad) e.variedad = "La variedad es obligatoria.";
      if (!siembra.dias_madurez_manual)
        e.dias = "Debes ingresar los días de maduración.";
    }
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
    else if (!rindeRegex.test(r))
      e.rinde = "Formato inválido. Use n,nn (ej: 3,45).";

    if (!e.fecha && siembra.fecha && cosecha.fecha) {
      const fechaC = new Date(cosecha.fecha);
      const fechaS = new Date(siembra.fecha);
      if (fechaC <= fechaS) {
        e.fecha = "La cosecha debe ser posterior a la fecha de siembra.";
      }
    }

    return e;
  };

  // === GUARDAR SIEMBRA ===
  const guardarSiembra = async ({ isEdit = false } = {}) => {
    const errs = validateSiembra();
    setErrorsSiembra(errs);
    if (Object.keys(errs).length) return false;

    const densidadNormalizada = siembra.densidad
      ? siembra.densidad.replace(",", ".")
      : "";

    const formData = new FormData();
    formData.append("fecha", siembra.fecha);
    formData.append("cultivo", siembra.cultivo);
    formData.append("variedad", siembra.variedad);
    formData.append("densidad", densidadNormalizada);
    formData.append("unidad_densidad", siembra.unidad);
    formData.append(
      "ventana_cosecha",
      siembra.fechaEstimadaCosechaISO || siembra.fechaEstimadaCosecha
    );
    formData.append("lote", loteId);

    if (siembra.modoCultivoLibre) {
      formData.append("dias_madurez_manual", siembra.dias_madurez_manual);
    }
    if (siembra.analisisSuelo) {
      formData.append("analisis_suelo", siembra.analisisSuelo);
    }

    const endpoint = siembra.id ? `/siembras/${siembra.id}/` : `/siembras/`;
    const method = siembra.id ? "put" : "post";

    try {
      const { data } = await axios({
        method,
        url: url(endpoint),
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nuevo = {
        ...siembra,
        ...data,
        id: data.id,
        fechaEstimadaCosechaISO:
          data.ventana_cosecha || siembra.fechaEstimadaCosechaISO,
      };
      setSiembra(nuevo);
      setOriginalSiembra(nuevo);

      if (!isEdit) {
        setShowSuccess("Siembra guardada con éxito");
      }
      await fetchEstadoLote();
      return true;
    } catch (error) {
      console.log("Backend error:", error?.response?.data || error.message);
      return false;
    }
  };

  // === GUARDAR COBERTURA ===
  const guardarCobertura = async ({ isEdit = false } = {}) => {
    const errs = validateCobertura();
    setErrorsCobertura(errs);
    if (Object.keys(errs).length) return false;

    const densidadNormalizada = cobertura.densidad
      ? cobertura.densidad.replace(",", ".")
      : "";

    const variedadFinal =
      cobertura.variedad === "__otra_var__"
        ? cobertura.variedadTextoLibre
        : cobertura.variedad;

    const payload = {
      fecha: cobertura.fecha,
      cultivo: cobertura.cultivo,
      variedad: variedadFinal,
      densidad: densidadNormalizada,
      lote: loteId,
    };

    try {
      let data;
      if (cobertura.id) {
        ({ data } = await axios.put(url(`/coberturas/${cobertura.id}/`), payload));
      } else {
        ({ data } = await axios.post(url(`/coberturas/`), payload));
      }

      const nuevo = { ...cobertura, ...data, id: data.id };
      setCobertura(nuevo);
      setOriginalCobertura(nuevo);

      if (!isEdit) {
        setShowSuccess("Cobertura guardada con éxito");
      }
      await fetchEstadoLote();
      return true;
    } catch (error) {
      console.error("Error al guardar cobertura:", error?.response?.data || error.message);
      alert(error?.response?.data?.error || "Error al registrar la cobertura.");
      return false;
    }
  };

  // === GUARDAR / REGISTRAR COSECHA ===
  const registrarCosecha = async ({ isEdit = false } = {}) => {
    const r = (cosecha.rinde || "").trim();
    const rindeRegex = /^\d+(,\d{1,2})?$/;

    if (!r) {
      setErrorRinde("Debe ingresar un rinde.");
      return false;
    }
    if (!rindeRegex.test(r)) {
      setErrorRinde(
        "Formato inválido. Ingrese un rinde con coma decimal. Ej: 7,5"
      );
      return false;
    }

    const errs = validateCosecha();
    setErrorsCosecha(errs);
    if (Object.keys(errs).length) return false;

    const rindeParaBackend = r.replace(",", ".");
    try {
      const rindeFinal = `${rindeParaBackend} tn/ha`;

      const formData = new FormData();
      formData.append("fecha", cosecha.fecha);
      formData.append("rinde", rindeFinal);
      formData.append("lote", loteId);

      if (cosecha.archivo) {
        formData.append("archivo_rendimiento", cosecha.archivo);
      }

      let data;
      if (cosecha.id) {
        ({ data } = await axios.put(url(`/cosechas/${cosecha.id}/`), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }));
      } else {
        ({ data } = await axios.post(url(`/cosechas/`), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }));
      }

      const nuevo = {
        ...cosecha,
        ...data,
        id: data.id,
      };
      setCosecha(nuevo);
      setOriginalCosecha(nuevo);

      await fetchEstadoLote();
      setErrorRinde("");
      if (!isEdit) {
        setShowSuccess("Cosecha registrada con éxito");
      }
      return true;
    } catch (error) {
      console.error("Error al registrar cosecha:", error?.response?.data || error.message);
      alert(error?.response?.data?.error || "Ocurrió un error al registrar la cosecha.");
      return false;
    }
  };

  // Finalizar campaña
  const finalizarCampania = async () => {
    if (estado !== "cosechado") return;
    try {
      const { data: finResp } = await axios.post(
        url(`/campanias/finalizar/${loteId}/`)
      );
      const vaciaSiembra = {
        id: null,
        fecha: "",
        cultivo: "",
        variedad: "",
        densidad: "",
        unidad: "Kg/Ha",
        fechaEstimadaCosecha: "",
        fechaEstimadaCosechaISO: "",
        analisisSuelo: null,
      };
      const vaciaCobertura = {
        id: null,
        fecha: "",
        cultivo: "",
        variedad: "",
        densidad: "",
      };
      const vaciaCosecha = { id: null, fecha: "", rinde: "", archivo: null };

      setSiembra(vaciaSiembra);
      setCobertura(vaciaCobertura);
      setCosecha(vaciaCosecha);

      setOriginalSiembra(vaciaSiembra);
      setOriginalCobertura(vaciaCobertura);
      setOriginalCosecha(vaciaCosecha);

      if (finResp?.lote_estado) setEstado(finResp.lote_estado);
      await fetchEstadoLote();
      setShowSuccess("Campaña finalizada con éxito. Lote en 'Barbecho'");
    } catch (error) {
      console.error("Error al finalizar campaña:", error?.response?.data || error.message);
      alert(error?.response?.data?.error || "Ocurrió un error al finalizar la campaña.");
    }
  };

  // Calendario
  const openDatePicker = (e) => {
    const input = e.currentTarget;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    }
  };

  // === HANDLERS EDIT / SAVE / CANCEL ===
  const handleEditSiembraClick = (e) => {
    e.stopPropagation();
    if (!hasSiembra) return;
    setIsEditingSiembra(true);
    setOpenSection("siembra");
  };

  const handleSaveSiembraClick = async (e) => {
    e.stopPropagation();
    const ok = await guardarSiembra({ isEdit: true });
    if (ok) setIsEditingSiembra(false);
  };

  const handleCancelSiembraClick = (e) => {
    e.stopPropagation();
    if (originalSiembra) {
      setSiembra(originalSiembra);
    }
    setIsEditingSiembra(false);
    setErrorsSiembra({});
  };

  const handleEditCoberturaClick = (e) => {
    e.stopPropagation();
    if (!hasCobertura) return;
    setIsEditingCobertura(true);
    setOpenSection("cobertura");
  };

  const handleSaveCoberturaClick = async (e) => {
    e.stopPropagation();
    const ok = await guardarCobertura({ isEdit: true });
    if (ok) setIsEditingCobertura(false);
  };

  const handleCancelCoberturaClick = (e) => {
    e.stopPropagation();
    if (originalCobertura) {
      setCobertura(originalCobertura);
    }
    setIsEditingCobertura(false);
    setErrorsCobertura({});
  };

  const handleEditCosechaClick = (e) => {
    e.stopPropagation();
    if (!hasCosecha) return;
    setIsEditingCosecha(true);
    setOpenSection("cosecha");
  };

  const handleSaveCosechaClick = async (e) => {
    e.stopPropagation();
    const ok = await registrarCosecha({ isEdit: true });
    if (ok) setIsEditingCosecha(false);
  };

  const handleCancelCosechaClick = (e) => {
    e.stopPropagation();
    if (originalCosecha) {
      setCosecha(originalCosecha);
    }
    setIsEditingCosecha(false);
    setErrorsCosecha({});
    setErrorRinde("");
  };

  const canFinalizar = estado === "cosechado";

  return (
    <div
      className="detalle-lote container-fluid p-4"
      style={{ backgroundColor: "#f0fdf4" }}
    >
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
            <li className="breadcrumb-item">
              <Link to="/campos">Campos</Link>
            </li>
            <li className="breadcrumb-item">
              {campoInfo.id ? (
                <Link to={`/campos/${campoInfo.id}/lotes`}>
                  {campoInfo.nombre || "Campo"}
                </Link>
              ) : (
                <span>{campoInfo.nombre || "Campo"}</span>
              )}
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {loteNombre}
            </li>
          </ol>
        </nav>

        <div className="ms-auto d-flex align-items-center gap-2">
          <button className="btn btn-outline-success">Actual</button>
          <button
            className="btn btn-outline-success"
            onClick={() => {
              if (historialRef.current) {
                const el = historialRef.current;
                const y =
                  el.getBoundingClientRect().top + window.pageYOffset - 12;
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
                className={`estado-chip ${estado === s ? `estado-${s}` : "estado-ghost"
                  }`}
              >
                {s}
              </span>
            ))}
          </div>

          <small className="text-muted d-block mt-2">
            {{
              barbecho:
                'Estado "Barbecho": el lote está listo para iniciar una nueva campaña.',
              cobertura:
                'Estado "Cobertura": el lote tiene una cobertura registrada en la campaña actual.',
              sembrado:
                'Estado "Sembrado": el lote tiene una siembra activa en esta campaña.',
              cosechado:
                'Estado "Cosechado": se registró una cosecha para esta campaña.',
            }[estado] ||
              "El estado del lote se actualiza automáticamente según las actividades registradas."}
          </small>
        </div>

        {/* Siembra */}
        <Section
          id="siembra"
          title="Registrar Siembra"
          enabled={siembraEnabled}
          isOpen={openSection === "siembra"}
          onToggle={setOpenSection}
          actions={
            hasSiembra && (
              <>
                {isEditingSiembra ? (
                  <>
                    <button
                      className="btn btn-outline-success btn-sm rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={handleSaveSiembraClick}
                      title="Guardar cambios de siembra"
                    >
                      <i className="bi bi-check" />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={handleCancelSiembraClick}
                      title="Cancelar edición"
                    >
                      <i className="bi bi-x" />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline-success btn-sm rounded-circle"
                    style={{ width: 34, height: 34, borderWidth: 2 }}
                    onClick={handleEditSiembraClick}
                    title="Editar siembra"
                  >
                    <i className="bi bi-pencil" />
                  </button>
                )}
              </>
            )
          }
        >
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
            errorDensidad={errorDensidad}
            setErrorDensidad={setErrorDensidad}
            isEditing={isEditingSiembra}
            canRegister={canRegisterSiembra && !hasSiembra}
          />
        </Section>

        {/* Cobertura */}
        <Section
          id="cobertura"
          title="Registrar Cobertura"
          enabled={coberturaEnabled}
          isOpen={openSection === "cobertura"}
          onToggle={setOpenSection}
          actions={
            hasCobertura && (
              <>
                {isEditingCobertura ? (
                  <>
                    <button
                      className="btn btn-outline-success btn-sm rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={handleSaveCoberturaClick}
                      title="Guardar cambios de cobertura"
                    >
                      <i className="bi bi-check" />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={handleCancelCoberturaClick}
                      title="Cancelar edición"
                    >
                      <i className="bi bi-x" />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline-success btn-sm rounded-circle"
                    style={{ width: 34, height: 34, borderWidth: 2 }}
                    onClick={handleEditCoberturaClick}
                    title="Editar cobertura"
                  >
                    <i className="bi bi-pencil" />
                  </button>
                )}
              </>
            )
          }
        >
          <FormCobertura
            cobertura={cobertura}
            setCobertura={setCobertura}
            cultivosDisponibles={cultivosDisponibles}
            variedadesDisponibles={variedadesCobertura}
            openDatePicker={openDatePicker}
            errorsCobertura={errorsCobertura}
            guardarCobertura={guardarCobertura}
            errorDensidadCobertura={errorDensidadCobertura}
            setErrorDensidadCobertura={setErrorDensidadCobertura}
            isEditing={isEditingCobertura}
            canRegister={canRegisterCobertura && !hasCobertura}
            handleChangeCobertura={handleChangeCobertura}
          />
        </Section>

        {/* Cosecha */}
        <Section
          id="cosecha"
          title="Registrar Cosecha"
          enabled={cosechaEnabled}
          isOpen={openSection === "cosecha"}
          onToggle={setOpenSection}
          actions={
            hasCosecha && (
              <>
                {isEditingCosecha ? (
                  <>
                    <button
                      className="btn btn-outline-success btn-sm rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={handleSaveCosechaClick}
                      title="Guardar cambios de cosecha"
                    >
                      <i className="bi bi-check" />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      style={{ width: 34, height: 34, borderWidth: 2 }}
                      onClick={handleCancelCosechaClick}
                      title="Cancelar edición"
                    >
                      <i className="bi bi-x" />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-outline-success btn-sm rounded-circle"
                    style={{ width: 34, height: 34, borderWidth: 2 }}
                    onClick={handleEditCosechaClick}
                    title="Editar cosecha"
                  >
                    <i className="bi bi-pencil" />
                  </button>
                )}
              </>
            )
          }
        >
          <FormCosecha
            cosecha={cosecha}
            setCosecha={setCosecha}
            minFechaCosechaISO={minFechaCosechaISO}
            errorsCosecha={errorsCosecha}
            handleCosechaChange={handleCosechaChange}
            registrarCosecha={registrarCosecha}
            openDatePicker={openDatePicker}
            errorRinde={errorRinde}
            setErrorRinde={setErrorRinde}
            isEditing={isEditingCosecha}
            canRegister={canRegisterCosecha && !hasCosecha}
          />
        </Section>

        {/* Finalizar campaña */}
        <div className="text-end mb-2">
          <button
            className={`btn btn-danger ${!canFinalizar ? "opacity-50" : ""}`}
            onClick={() => canFinalizar && abrirConfirmEnd()}
            disabled={!canFinalizar}
            title={
              !canFinalizar ? "Disponible cuando el lote está Cosechado" : ""
            }
          >
            Finalizar Campaña
          </button>
        </div>
      </div>

      {/* Historial */}
      <hr className="my-4" />
      <div ref={historialRef} id="historial-campanias">
        <HistorialCampanias
          embedded
          loteId={loteId}
          campoInfoProp={campoInfo}
          loteNombreProp={loteNombre}
        />
      </div>

      {/* Modal confirmar finalizar */}
      {showConfirmEnd && (
        <div
          className="confirm-overlay"
          onClick={(e) => e.target === e.currentTarget && cerrarConfirmEnd()}
        >
          <div className="confirm-card p-4">
            <h5 className="fw-bold mb-2">¿Seguro quiere Finalizar campaña?</h5>
            <p className="mb-4">
              Los registros de la campaña pasarán al historial.
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={cerrarConfirmEnd}
              >
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

      <SuccessAlert
        show={!!showSuccess}
        title={showSuccess}
        onClose={() => {
          setShowSuccess(null);
          if (showSuccess === "Campaña finalizada con éxito. Lote en 'Barbecho'") {
            window.location.reload();
          }
        }}
      />
    </div>
  );
};

export default DetalleLote;
