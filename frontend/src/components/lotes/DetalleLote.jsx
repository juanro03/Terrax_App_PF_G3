import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import dayjs from 'dayjs';
import "./DetalleLote.css";
import { FaArrowLeft } from "react-icons/fa";



const DetalleLote = () => {
  const [estado, setEstado] = useState("barbecho");
  const [unidadDensidad, setUnidadDensidad] = useState("Kg/Ha");
  const { loteId } = useParams();
  const [cosecha, setCosecha] = useState({
    fecha: '',
    rinde: '',
    archivo: null,
  });
  const location = useLocation();
  const navigate  = useNavigate();

  // viene desde VerLotes si lo pasaste en navigate(..., { state })
  const [campoInfo, setCampoInfo] = useState({
    id: location.state?.campoId ?? null,
    nombre: location.state?.campoNombre ?? "",
  });
  // nombre del lote para el breadcrumb
  const loteNombre = location.state?.loteNombre ?? `Lote ${loteId}`;

  // si no vino el campo en el state, lo busco por API desde el lote
  useEffect(() => {
    if (campoInfo.id) return;
    (async () => {
      try {
        const { data: lote } = await axios.get(`http://127.0.0.1:8000/api/lotes/${loteId}/`);
        const campoId = lote.campo;
        let campoNombre = "";
        try {
          const { data: campo } = await axios.get(`http://127.0.0.1:8000/api/campos/${campoId}/`);
          campoNombre = campo.nombre;
        } catch {}
        setCampoInfo({ id: campoId, nombre: campoNombre });
      } catch (e) {
        console.error("No pude obtener el campo del lote", e);
      }
    })();
  }, [loteId, campoInfo.id]);

  // volver SIEMPRE a los lotes del campo
  const handleBack = () => {
    if (campoInfo.id) navigate(`/campos/${campoInfo.id}/lotes`);
    else navigate("/campos");
  };
  // Modal de confirmación
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const puedeFinalizar = estado === "cultivado";

  const abrirConfirmEnd = () => {
    if (!puedeFinalizar) return;
    setShowConfirmEnd(true);
  };
  const cerrarConfirmEnd = () => setShowConfirmEnd(false);

  // Para cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowConfirmEnd(false);
    if (showConfirmEnd) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showConfirmEnd]);


  const [siembra, setSiembra] = useState({
    fecha: "",
    cultivo: "",
    variedad: "",
    densidad: "",
    unidad: "Kg/Ha",
    fechaEstimadaCosecha: "",
    fechaEstimadaCosechaISO: "", // 👉 NUEVO
    analisisSuelo: null
  });
  const [mostrarCobertura, setMostrarCobertura] = useState(false);
  const [cobertura, setCobertura] = useState({
    fecha: '',
    cultivo: '',
    variedad: '',
    densidad: ''
  });
  const coberturaYaCargada = Boolean(cobertura?.fecha); // <-- Acá va

  const handleSiembraChange = (e) => {
    const { name, value, files } = e.target;
    setSiembra((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };
  const [semillas, setSemillas] = useState([]);
  const token = localStorage.getItem("accessToken");
  useEffect(() => {
    const obtenerSemillas = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/productos/?categoria=SEMILLAS", {
          headers: {
            Authorization: `Bearer ${token}`, // si usás JWT
          },
        });
        setSemillas(response.data);
      } catch (error) {
        console.error("Error al obtener las semillas:", error);
      }
    };

    obtenerSemillas();
  }, []);
  useEffect(() => {
    if (siembra.fecha && siembra.cultivo && siembra.variedad && semillas.length > 0) {
      const semilla = semillas.find(
        s => s.cultivo === siembra.cultivo && s.variedad === siembra.variedad
      );

      if (semilla) {
        const dias = parseInt(semilla.dias_madurez);
        if (!isNaN(dias)) {
          const fechaSiembra = new Date(siembra.fecha);
          fechaSiembra.setDate(fechaSiembra.getDate() + dias);
          const cosecha = dayjs(fechaSiembra).format("DD/MM/YYYY");
          const cosechaISO = dayjs(fechaSiembra).format("YYYY-MM-DD");

          setSiembra(prev => ({
            ...prev,
            fechaEstimadaCosecha: cosecha,
            fechaEstimadaCosechaISO: cosechaISO  // 👉 NUEVO
          }));
        }
      }
    }
  }, [siembra.fecha, siembra.cultivo, siembra.variedad, semillas]);
  // En useEffect (al cargar el componente)
  useEffect(() => {
    const obtenerSiembra = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/siembras/por-lote/${loteId}`);
        const siembraData = response.data;

        setSiembra({
          ...siembraData,
          fechaEstimadaCosechaISO: siembraData.ventana_cosecha // <--- asegurate de guardar este campo en ISO
        });

        setEstado("cultivado");
      } catch (error) {
        console.log("No hay siembra registrada aún.");
      }
    };

    obtenerSiembra();
  }, [loteId]);

  useEffect(() => {
    const obtenerCobertura = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/coberturas/por-lote/${loteId}/`);
        setCobertura(res.data);
        setMostrarCobertura(true);
      } catch (error) {
        console.log("No hay cobertura registrada.");
      }
    };

    obtenerCobertura();
  }, [loteId]);
  const guardarCobertura = async () => {
    try {
      const coberturaConLote = { ...cobertura, lote: loteId };

      if (cobertura.id) {
        await axios.put(`http://localhost:8000/api/coberturas/${cobertura.id}/`, coberturaConLote);
      } else {
        await axios.post(`http://localhost:8000/api/coberturas/`, coberturaConLote);
      }

      alert("Cobertura guardada correctamente");
    } catch (error) {
      console.error("Error al guardar cobertura:", error);
    }
  };

  const guardarSiembra = async () => {
    const formData = new FormData();
    formData.append("fecha", siembra.fecha);
    formData.append("cultivo", siembra.cultivo);
    formData.append("variedad", siembra.variedad);
    formData.append("densidad", siembra.densidad);
    formData.append("unidad_densidad", siembra.unidad);
    formData.append("ventana_cosecha", siembra.fechaEstimadaCosechaISO || siembra.fechaEstimadaCosecha);
    formData.append("lote", loteId);

    if (siembra.analisisSuelo) {
      formData.append("analisis_suelo", siembra.analisisSuelo);
    }

    const url = siembra.id
      ? `http://127.0.0.1:8000/api/siembras/${siembra.id}/`
      : "http://127.0.0.1:8000/api/siembras/";

    const method = siembra.id ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Siembra guardada correctamente");
      setEstado("cultivado");
    } catch (error) {
      if (error.response) {
        console.log("Backend error data:", error.response.data);
      } else {
        console.log("Other error:", error.message);
      }
    }
  };
  const handleCosechaChange = (e) => {
    const { name, value, files } = e.target;
    setCosecha((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };
  const finalizarCampania = async () => {
    if (estado !== "cultivado") {
      alert("El lote está en barbecho.");
      return;
    }
    try {
      // Validar que la fecha de cosecha > ventana de cosecha
      const fechaCosecha = new Date(cosecha.fecha);
      const fechaEstimadaCosecha = new Date(siembra.fechaEstimadaCosechaISO); // <-- esta debe estar en formato YYYY-MM-DD

      if (fechaCosecha < fechaEstimadaCosecha) {
        alert("La fecha de cosecha debe ser posterior a la fecha estimada de cosecha.");
        return;
      }

      // Validar rinde obligatorio
      if (!cosecha.rinde || cosecha.rinde.trim() === "") {
        alert("El campo 'Rinde' es obligatorio.");
        return;
      }

      const formData = new FormData();
      formData.append("fecha", cosecha.fecha);
      // Validar formato del rinde: ejemplo 3,45
      const rindeSoloNumero = cosecha.rinde.trim();
      const rindeRegex = /^\d{1,3}(,\d{1,2})?$/;

      if (!rindeRegex.test(rindeSoloNumero)) {
        alert("El rinde debe tener el formato 'n,nn'. Ejemplo: 3,45");
        return;
      }

      const rindeFinal = `${rindeSoloNumero} tn/ha`; // Le agregamos unidad

      formData.append("rinde", rindeFinal);
      formData.append("lote", loteId);
      if (cosecha.archivo) {
        formData.append("archivo_rendimiento", cosecha.archivo);
      }

      await axios.post("http://localhost:8000/api/cosechas/", formData);
      await axios.post(`http://localhost:8000/api/siembras/finalizar/${loteId}/`);

      // Reset
      setEstado("barbecho");
      setSiembra({
        fecha: "",
        cultivo: "",
        variedad: "",
        densidad: "",
        unidad: "Kg/Ha",
        fechaEstimadaCosecha: "",
        analisisSuelo: null
      });
      setMostrarCobertura(false);
      setCosecha({
        fecha: "",
        rinde: "",
        archivo: null
      });
      setCobertura({
        fecha: '',
        cultivo: '',
        variedad: '',
        densidad: ''
      });

      alert("Cosecha registrada y campaña finalizada.");
    } catch (error) {
      console.error("Error al finalizar campaña:", error);
      alert("Ocurrió un error al finalizar la campaña.");
    }
  };
  // después de tus useState, arriba del return:
  const minFechaCosechaISO = siembra.fechaEstimadaCosechaISO
    ? dayjs(siembra.fechaEstimadaCosechaISO).add(1, "day").format("YYYY-MM-DD")
    : "";
  useEffect(() => {
    if (!siembra.fechaEstimadaCosechaISO) return;

    const min = dayjs(siembra.fechaEstimadaCosechaISO)
      .add(1, "day")
      .format("YYYY-MM-DD");

    setCosecha(prev => {
      if (!prev.fecha || dayjs(prev.fecha).isBefore(min, "day")) {
        return { ...prev, fecha: min };
      }
      return prev;
    });
  }, [siembra.fechaEstimadaCosechaISO]);

  
  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f0fdf4" }}>
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
          onClick={() =>
            navigate(`/lotes/${loteId}/historial`, {
              state: { campoId: campoInfo.id, campoNombre: campoInfo.nombre, loteNombre },
            })
          }
        >
          Historial
        </button>
        <button className="btn btn-outline-success">Reportes</button>
      </div>
    </div>



      <div className="row g-4">
        {/* Columna izquierda */}
        <div className="col-md-6 d-flex flex-column justify-content-between">
          <div className="d-flex flex-column h-100">
            {/* Estado del Lote */}
            <div className="card p-3 mb-4" style={{ borderRadius: "15px" }}>
              <h5 className="fw-bold mb-3">Estado del Lote</h5>
              <div className="btn-group" role="group">
                <button
                  className={`btn ${estado === 'barbecho' ? 'btn-success' : 'btn-outline-success'}`}
                  disabled={estado === 'cultivado'} // si está cultivado, no dejar volver a barbecho
                  style={{ cursor: estado === 'cultivado' ? 'not-allowed' : 'pointer' }}
                  onClick={() => setEstado("barbecho")}
                >
                  Barbecho
                </button>
                <button
                  className={`btn ${estado === 'cultivado' ? 'btn-success' : 'btn-outline-success'}`}
                  disabled={estado === 'barbecho'} // si está en barbecho, no dejar marcar cultivado (opcional)
                  style={{ cursor: estado === 'barbecho' ? 'not-allowed' : 'pointer' }}
                  onClick={() => setEstado("cultivado")}
                >
                  Cultivado
                </button>
              </div>

            </div>

            {/* Siembra */}
            <div className="card p-3 shadow-sm flex-grow-1 d-flex flex-column justify-content-between" style={{ borderRadius: "15px" }}>
              <div>
                <h5 className="fw-bold mb-3">Siembra</h5>
                <div className="mb-2">
                  <label className="form-label">Fecha</label>
                  <input type="date" name="fecha" className="form-control" value={siembra.fecha} onChange={handleSiembraChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Cultivo</label>
                  <select
                    name="cultivo"
                    className="form-control"
                    value={siembra.cultivo}
                    onChange={handleSiembraChange}
                  >
                    <option value="">Seleccionar cultivo</option>
                    {[...new Set(semillas.map((s) => s.cultivo))].map((cultivo, index) => (
                      <option key={index} value={cultivo}>
                        {cultivo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-2">
                  <label className="form-label">Variedad</label>
                  <select
                    name="variedad"
                    className="form-control"
                    value={siembra.variedad}
                    onChange={handleSiembraChange}
                    disabled={!siembra.cultivo}
                  >
                    <option value="">Seleccionar variedad</option>
                    {[...new Set(semillas
                      .filter((s) => s.cultivo === siembra.cultivo)
                      .map((s) => s.variedad))].map((variedad, index) => (
                        <option key={index} value={variedad}>
                          {variedad}
                        </option>
                    ))}

                  </select>
                </div>

                {/* Densidad con unidad */}
                <div className="mb-2">
                    <label className="form-label">Densidad</label>
                    <div className="input-group">
                        <input
                        type="text"
                        name="densidad"
                        className="form-control"
                        value={siembra.densidad || ""}
                        onChange={handleSiembraChange}
                        style={{ height: "48px" }}
                        />
                        <button
                        type="button"
                        className={`btn ${unidadDensidad === "Kg/Ha" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => {
                            setUnidadDensidad("Kg/Ha");
                            setSiembra((prev) => ({ ...prev, unidad: "Kg/Ha" }));
                        }}
                        style={{ height: "48px" }}
                        >
                        Kg/Ha
                        </button>
                        <button
                        type="button"
                        className={`btn ${unidadDensidad === "Pl/Ha" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => {
                            setUnidadDensidad("Pl/Ha");
                            setSiembra((prev) => ({ ...prev, unidad: "Pl/Ha" }));
                        }}
                        style={{ height: "48px" }}
                        >
                        Pl/Ha
                        </button>
                    </div>
                </div>
                <div className="mb-2">
                  <label className="form-label">Fecha estimada de cosecha</label>
                  <input
                    type="text"
                    name="fechaEstimadaCosecha"
                    className="form-control auto-field"
                    value={siembra.fechaEstimadaCosecha || ""}
                    readOnly
                    title="Se calcula automáticamente según la ventana de cosecha de la semilla."
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Último análisis de suelo</label>

                  {estado === "cultivado" && siembra.analisis_suelo ? (
                    <>
                      <div className="form-control bg-light text-muted">
                        No se puede cambiar el archivo porque el lote ya está cultivado.
                      </div>
                    </>
                  ) : (
                    <input
                      type="file"
                      name="analisisSuelo"
                      className="form-control mb-2"
                      onChange={handleSiembraChange}
                    />
                  )}

                  {siembra.analisis_suelo && (
                    <div className="d-flex align-items-start gap-3 mt-2 p-2 rounded" style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                      <img
                        src={siembra.analisis_suelo}
                        alt="Análisis de suelo"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          border: "1px solid #ccc"
                        }}
                      />
                      <div className="flex-grow-1">
                        <small className="text-muted">Archivo cargado</small>
                        <p className="mb-0 text-truncate" title={siembra.analisis_suelo}>
                          {siembra.analisis_suelo.split("/").pop()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <button className="btn btn-success w-100 mt-3" onClick={guardarSiembra}>
                Guardar Siembra
              </button>
            </div>
          </div>
        </div>
        {/* Columna derecha */}
        <div className="col-md-6">         
          {/* Cosecha */}
          <div className="card p-3 shadow-sm mb-3" style={{ borderRadius: "15px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Cosecha</h5>
              <button
                className={`btn btn-danger ${!puedeFinalizar ? "opacity-50" : ""}`}
                onClick={abrirConfirmEnd}
                disabled={!puedeFinalizar}
                title={!puedeFinalizar ? "Debes marcar el lote como 'Cultivado' para finalizar la campaña" : ""}
              >
                Finalizar Campaña
              </button>
            </div>

            <div className="mb-2">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                name="fecha"
                className="form-control"
                value={cosecha.fecha || ""}         // en "YYYY-MM-DD"
                min={minFechaCosechaISO}           // bloqueo de días anteriores
                onChange={handleCosechaChange}
              />
              {minFechaCosechaISO && (
                <small className="text-muted">
                  Debe ser posterior a {dayjs(minFechaCosechaISO).subtract(1, "day").format("DD/MM/YYYY")}.
                </small>
              )}
            </div>

            <div className="mb-2">
              <label className="form-label">Rinde</label>
              <div className="input-group">
                <input
                  type="text"
                  name="rinde"
                  className="form-control"
                  value={cosecha.rinde || ""}
                  onChange={(e) =>
                    setCosecha((prev) => ({ ...prev, rinde: e.target.value }))
                  }
                  style={{ height: "48px" }}
                />
                <span
                  className="input-group-text text-white"
                  style={{
                    height: "48px",
                    backgroundColor: "#198754", // verde bootstrap
                    border: "1px solid #198754",
                  }}
                >
                  Tn/Ha
                </span>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label">Archivo de Rendimiento</label>
              <input
                type="file"
                name="archivo"
                className="form-control"
                onChange={handleCosechaChange}
              />
            </div>
          </div>
                  
          {/* Botón Agregar Cobertura */}
          {!mostrarCobertura && (
            <button
              className="btn btn-outline-success w-100 mb-3"
              onClick={() => setMostrarCobertura(true)}
            >
              Agregar Cobertura
            </button>
          )}

          {/* Formulario Cobertura */}
          {mostrarCobertura && (
            <div className="card p-3 shadow-sm" style={{ borderRadius: "15px" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Cobertura</h5>
                <button
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setMostrarCobertura(false)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={cobertura?.fecha || ""}
                  onChange={(e) =>
                    setCobertura({ ...cobertura, fecha: e.target.value })
                  }
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Cultivo</label>
                <input
                  type="text"
                  className="form-control"
                  value={cobertura?.cultivo || ""}
                  onChange={(e) =>
                    setCobertura({ ...cobertura, cultivo: e.target.value })
                  }
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Variedad</label>
                <input
                  type="text"
                  className="form-control"
                  value={cobertura?.variedad || ""}
                  onChange={(e) =>
                    setCobertura({ ...cobertura, variedad: e.target.value })
                  }
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Densidad</label>
                <input
                  type="text"
                  className="form-control"
                  value={cobertura?.densidad || ""}
                  onChange={(e) =>
                    setCobertura({ ...cobertura, densidad: e.target.value })
                  }
                />
              </div>
              <div className="text-end">
                <button
                  className="btn btn-success text-white"
                  onClick={guardarCobertura}
                >
                  Guardar Cobertura
                </button>
              </div>
            </div>
          )}     
        </div>   {/* Fin de la columna derecha */}
      </div>     {/* Fin del row */}
      {showConfirmEnd && (
        <div
          className="confirm-overlay"
          onClick={(e) => e.target === e.currentTarget && cerrarConfirmEnd()}
        >
          <div className="confirm-card p-4">
            <h5 className="fw-bold mb-2">¿Finalizar campaña?</h5>
            <p className="mb-2">
              Esta acción es irreversible: no podrás editar la siembra ni cargar nuevos datos.
            </p>
            <p className="mb-4">Los registros pasarán a Historial.</p>

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
