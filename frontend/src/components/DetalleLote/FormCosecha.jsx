import React from "react";

const FormCosecha = ({
  cosecha,
  setCosecha,
  minFechaCosechaISO,
  openDatePicker,
  errorsCosecha,
  handleCosechaChange,
  registrarCosecha,
}) => {
  return (
    <>
      <div className="mb-2">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          name="fecha"
          className={`form-control ${errorsCosecha?.fecha ? "is-invalid" : ""}`}
          value={cosecha.fecha || ""}
          min={minFechaCosechaISO}
          onChange={handleCosechaChange}
          onClick={openDatePicker}
          autoComplete="off"
        />
        {errorsCosecha.fecha && <div className="invalid-feedback d-block">{errorsCosecha.fecha}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Rinde</label>
        <div className="input-group">
          <input
            type="text"
            name="rinde"
            className={`form-control ${errorsCosecha?.rinde ? "is-invalid" : ""}`}
            value={cosecha.rinde || ""}
            onChange={(e) => setCosecha((prev) => ({ ...prev, rinde: e.target.value }))}
            style={{ height: "48px" }}
            autoComplete="off"
          />
          <span
            className="input-group-text text-white"
            style={{ height: "48px", backgroundColor: "#198754", border: "1px solid #198754" }}
          >
            Tn/Ha
          </span>
        </div>
        {errorsCosecha.rinde && <div className="invalid-feedback d-block">{errorsCosecha.rinde}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Archivo de Rendimiento (opcional)</label>
        <input type="file" name="archivo" className="form-control" onChange={handleCosechaChange} />
      </div>

      <button className="btn btn-success w-100" onClick={registrarCosecha}>
        Registrar Cosecha
      </button>
    </>
  );
};

export default React.memo(FormCosecha);
