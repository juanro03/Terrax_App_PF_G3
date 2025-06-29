import React, { useState } from "react";
import axios from 'axios';



const DetalleLote = () => {
  const [estado, setEstado] = useState("barbecho");
  const [unidadDensidad, setUnidadDensidad] = useState("Kg/Ha");

  const [siembra, setSiembra] = useState({
    fecha: "",
    cultivo: "",
    variedad: "",
    densidad: "",
    unidad: "Kg/Ha",
    ventanaCosecha: "",
    analisisSuelo: null
  });

  const handleSiembraChange = (e) => {
    const { name, value, files } = e.target;
    setSiembra((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const guardarSiembra = async () => {
    const formData = new FormData();
    formData.append("fecha", siembra.fecha);
    formData.append("cultivo", siembra.cultivo);
    formData.append("variedad", siembra.variedad);
    formData.append("densidad", siembra.densidad);
    formData.append("unidad", siembra.unidad);
    formData.append("ventana_cosecha", siembra.ventanaCosecha);
    formData.append("lote", 1); // ⚠️ reemplazá con el ID real del lote
    if (siembra.analisisSuelo) {
      formData.append("analisis_suelo", siembra.analisisSuelo);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/siembras/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Siembra guardada correctamente");
      setEstado("cultivado");
    } catch (error) {
      console.error("Error al guardar siembra:", error);
      alert("Error al guardar siembra");
    }
  };


  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f0fdf4" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-success">Campo: La Josefina &gt; Lote 1</h4>
        <div>
          <button className="btn btn-success me-2">Actual</button>
          <button className="btn btn-outline-success me-2">Historico</button>
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
                  onClick={() => setEstado("barbecho")}
                >
                  Barbecho
                </button>
                <button
                  className={`btn ${estado === 'cultivado' ? 'btn-success' : 'btn-outline-success'}`}
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
                  <input type="text" name="cultivo" className="form-control" value={siembra.cultivo} onChange={handleSiembraChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Variedad</label>
                  <input type="text" name="variedad" className="form-control" value={siembra.variedad} onChange={handleSiembraChange} />
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
                  <label className="form-label">Ventana Cosecha</label>
                  <input type="text" name="ventanaCosecha" className="form-control" value={siembra.ventanaCosecha} onChange={handleSiembraChange} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Último análisis de suelo</label>
                  <input type="file" name="analisisSuelo" className="form-control" onChange={handleSiembraChange} />
                </div>
              </div>

              <button className="btn btn-success w-100 mt-3" onClick={guardarSiembra}>
                Guardar Siembra
              </button>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-md-6 d-flex flex-column justify-content-between">
          {/* Cobertura */}
          <div className="card p-3 shadow-sm mb-4" style={{ borderRadius: "15px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Cobertura</h5>
              <button className="btn btn-outline-danger">Fin de Cobertura</button>
            </div>
            <div className="mb-2">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-control" />
            </div>
            <div className="mb-2">
              <label className="form-label">Cultivo</label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-2">
              <label className="form-label">Variedad</label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-2">
              <label className="form-label">Densidad</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          {/* Cosecha */}
          <div className="card p-3 shadow-sm" style={{ borderRadius: "15px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold">Cosecha</h5>
              <button className="btn btn-danger">Finalizar Campaña</button>
            </div>
            <div className="mb-2">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-control" />
            </div>
            <div className="mb-2">
              <label className="form-label">Rinde</label>
              <input type="text" className="form-control" />
            </div>
            <div className="mb-2">
              <label className="form-label">Archivo de Rendimiento</label>
              <input type="file" className="form-control" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleLote;
