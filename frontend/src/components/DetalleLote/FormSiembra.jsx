import React from "react";

const FormSiembra = ({
  siembra,
  setSiembra,
  unidadDensidad,
  setUnidadDensidad,
  cultivosDisponibles,
  variedadesDisponibles,
  openDatePicker,
  handleSiembraChange,
  guardarSiembra,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardarSiembra();
      }}
    >
      {/* FECHA */}
      <div className="mb-2">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          name="fecha"
          className="form-control"
          value={siembra.fecha || ""}
          onChange={handleSiembraChange}
          onClick={openDatePicker}
          required
        />
      </div>

      {/* CULTIVO */}
      <div className="mb-2">
        <label className="form-label">Cultivo</label>
        <select
          name="cultivo"
          className="form-control"
          value={siembra.cultivo || ""}
          onChange={handleSiembraChange}
          required
        >
          <option value="">Seleccionar cultivo</option>
          {cultivosDisponibles.map((cultivo, i) => (
            <option key={i} value={cultivo}>{cultivo}</option>
          ))}
        </select>
      </div>

      {/* VARIEDAD */}
      <div className="mb-2">
        <label className="form-label">Variedad de cultivo</label>
        <select
          name="variedad"
          className="form-control"
          value={siembra.variedad || ""}
          onChange={handleSiembraChange}
          disabled={!siembra.cultivo}
          required
        >
          <option value="">Seleccionar variedad</option>
          {variedadesDisponibles.map((variedad, i) => (
            <option key={i} value={variedad}>{variedad}</option>
          ))}
        </select>
      </div>

      {/* DENSIDAD */}
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
            required
          />

          <button
            type="button"
            className={`btn ${unidadDensidad === "Kg/Ha" ? "btn-success" : "btn-outline-success"}`}
            style={{ height: "48px" }}
            onClick={() => {
              setUnidadDensidad("Kg/Ha");
              setSiembra((p) => ({ ...p, unidad: "Kg/Ha" }));
            }}
          >
            Kg/Ha
          </button>

          <button
            type="button"
            className={`btn ${unidadDensidad === "Pl/Ha" ? "btn-success" : "btn-outline-success"}`}
            style={{ height: "48px" }}
            onClick={() => {
              setUnidadDensidad("Pl/Ha");
              setSiembra((p) => ({ ...p, unidad: "Pl/Ha" }));
            }}
          >
            Pl/Ha
          </button>
        </div>
      </div>

      {/* FECHA ESTIMADA */}
      <div className="mb-2">
        <label className="form-label">Fecha estimada de cosecha</label>
        <input
          type="text"
          className="form-control"
          value={siembra.fechaEstimadaCosecha || ""}
          readOnly
        />
      </div>

      {/* ANALISIS OPCIONAL */}
      <div className="mb-2">
        <label className="form-label">Último análisis de suelo (opcional)</label>
        <input
          type="file"
          name="analisisSuelo"
          className="form-control"
          onChange={handleSiembraChange}
        />
      </div>

      <button className="btn btn-success w-100 mt-2" type="submit">
        Registrar Siembra
      </button>
    </form>
  );
};

export default React.memo(FormSiembra);
