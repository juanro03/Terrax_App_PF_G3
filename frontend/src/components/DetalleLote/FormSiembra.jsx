import React from "react";

const FormSiembra = ({
  siembra,
  setSiembra,
  unidadDensidad,
  setUnidadDensidad,
  cultivosDisponibles,
  variedadesDisponibles,
  openDatePicker,
  errorsSiembra,
  handleSiembraChange,
  guardarSiembra,
}) => {
  return (
    <>
      <div className="mb-2">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          name="fecha"
          className="form-control"
          value={siembra.fecha || ""}
          onChange={handleSiembraChange}
          onClick={openDatePicker}
          autoComplete="off"
        />
        {errorsSiembra?.fecha && <div className="invalid-feedback d-block">{errorsSiembra.fecha}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Cultivo</label>
        <select
          name="cultivo"
          className="form-control"
          value={siembra.cultivo || ""}
          onChange={handleSiembraChange}
        >
          <option value="">Seleccionar cultivo</option>
          {cultivosDisponibles.map((cultivo, i) => (
            <option key={i} value={cultivo}>{cultivo}</option>
          ))}
        </select>
        {errorsSiembra?.cultivo && <div className="invalid-feedback d-block">{errorsSiembra.cultivo}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Variedad de cultivo</label>
        <select
          name="variedad"
          className="form-control"
          value={siembra.variedad || ""}
          onChange={handleSiembraChange}
          disabled={!siembra.cultivo}
        >
          <option value="">Seleccionar variedad</option>
          {variedadesDisponibles.map((variedad, i) => (
            <option key={i} value={variedad}>{variedad}</option>
          ))}
        </select>
        {siembra.cultivo && variedadesDisponibles.length === 0 && (
          <small className="text-muted d-block mt-1">
            No hay variedades registradas para <strong>{siembra.cultivo}</strong>. Cargá variedades en <strong>Productos</strong>.
          </small>
        )}
        {errorsSiembra?.variedad && <div className="invalid-feedback d-block">{errorsSiembra.variedad}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Densidad de siembra</label>
        <div className="input-group">
          <input
            type="text"
            name="densidad"
            className="form-control"
            value={siembra.densidad || ""}
            onChange={handleSiembraChange}
            style={{ height: "48px" }}
            autoComplete="off"
          />
          <button
            type="button"
            className={`btn ${unidadDensidad === "Kg/Ha" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => { setUnidadDensidad("Kg/Ha"); setSiembra((p) => ({ ...p, unidad: "Kg/Ha" })); }}
            style={{ height: "48px" }}
          >
            Kg/Ha
          </button>
          <button
            type="button"
            className={`btn ${unidadDensidad === "Pl/Ha" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => { setUnidadDensidad("Pl/Ha"); setSiembra((p) => ({ ...p, unidad: "Pl/Ha" })); }}
            style={{ height: "48px" }}
          >
            Pl/Ha
          </button>
        </div>
        {errorsSiembra?.densidad && <div className="invalid-feedback d-block">{errorsSiembra.densidad}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Fecha estimada de cosecha (se calcula automáticamente)</label>
        <input
          type="text"
          name="fechaEstimadaCosecha"
          className="form-control auto-field"
          value={siembra.fechaEstimadaCosecha || ""}
          readOnly
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Último análisis de suelo (opcional)</label>
        <input type="file" name="analisisSuelo" className="form-control mb-2" onChange={handleSiembraChange} />
        {siembra.analisis_suelo && (
          <div className="d-flex align-items-start gap-3 mt-2 p-2 rounded file-chip">
            <img src={siembra.analisis_suelo} alt="Análisis de suelo" className="chip-thumb" />
            <div className="flex-grow-1">
              <small className="text-muted">Archivo cargado</small>
              <p className="mb-0 text-truncate" title={siembra.analisis_suelo}>
                {String(siembra.analisis_suelo).split("/").pop()}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-success w-100 mt-2"
        onClick={guardarSiembra}
        title={cultivosDisponibles.length === 0 ? "Cargá semillas en Productos para habilitar" : ""}
        disabled={cultivosDisponibles.length === 0}
      >
        Registrar Siembra
      </button>
    </>
  );
};

export default React.memo(FormSiembra);
