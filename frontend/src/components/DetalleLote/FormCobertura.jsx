import React from "react";

const defaultCobertura = { fecha: "", cultivo: "", variedad: "", densidad: "" };

const FormCobertura = ({
  cobertura = defaultCobertura,
  setCobertura,
  cultivosDisponibles,
  openDatePicker,
  guardarCobertura,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardarCobertura();
      }}
    >
      {/* FECHA */}
      <div className="mb-2">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          className="form-control"
          value={cobertura.fecha || ""}
          onChange={(e) => setCobertura((p) => ({ ...p, fecha: e.target.value }))}
          onClick={openDatePicker}
          required
        />
      </div>

      {/* CULTIVO */}
      <div className="mb-2">
        <label className="form-label">Cultivo</label>
        <input
          type="text"
          className="form-control"
          value={cobertura.cultivo || ""}
          onChange={(e) => setCobertura((p) => ({ ...p, cultivo: e.target.value }))}
          autoComplete="off"
          required
        />
      </div>

      {/* VARIEDAD */}
      <div className="mb-2">
        <label className="form-label">Variedad de cultivo</label>
        <input
          type="text"
          className="form-control"
          value={cobertura.variedad || ""}
          onChange={(e) => setCobertura((p) => ({ ...p, variedad: e.target.value }))}
          autoComplete="off"
          required
        />
      </div>

      {/* DENSIDAD */}
      <div className="mb-2">
        <label className="form-label">Densidad de siembra</label>
        <input
          type="text"
          className="form-control"
          value={cobertura.densidad || ""}
          onChange={(e) => setCobertura((p) => ({ ...p, densidad: e.target.value }))}
          autoComplete="off"
          required
        />
      </div>

      <button
        className="btn btn-success w-100"
        type="submit"
        disabled={cultivosDisponibles.length === 0}
      >
        Registrar Cobertura
      </button>
    </form>
  );
};

export default React.memo(FormCobertura);
