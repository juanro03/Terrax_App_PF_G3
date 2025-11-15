import React from "react";

const defaultCobertura = { fecha: "", cultivo: "", variedad: "", densidad: "" };

const FormCobertura = ({
  cobertura = defaultCobertura,
  setCobertura,
  cultivosDisponibles,
  openDatePicker,
  errorsCobertura = {},
  guardarCobertura,
}) => {
  return (
    <>
      <div className="mb-2">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          className="form-control"
          value={cobertura?.fecha || ""}
          onChange={(e) => setCobertura((prev) => ({ ...prev, fecha: e.target.value }))}
          /* usar solo gesto real de usuario, no onFocus */
          onClick={openDatePicker}
          autoComplete="off"
        />
        {errorsCobertura.fecha && <div className="invalid-feedback d-block">{errorsCobertura.fecha}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Cultivo</label>
        <input
          type="text"
          className="form-control"
          value={cobertura?.cultivo || ""}
          onChange={(e) => setCobertura((prev) => ({ ...prev, cultivo: e.target.value }))}
          autoComplete="off"
        />
        {errorsCobertura.cultivo && <div className="invalid-feedback d-block">{errorsCobertura.cultivo}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Variedad de cultivo</label>
        <input
          type="text"
          className="form-control"
          value={cobertura?.variedad || ""}
          onChange={(e) => setCobertura((prev) => ({ ...prev, variedad: e.target.value }))}
          autoComplete="off"
        />
        {errorsCobertura.variedad && <div className="invalid-feedback d-block">{errorsCobertura.variedad}</div>}
      </div>

      <div className="mb-2">
        <label className="form-label">Densidad de siembra</label>
        <input
          type="text"
          className="form-control"
          value={cobertura?.densidad || ""}
          onChange={(e) => setCobertura((prev) => ({ ...prev, densidad: e.target.value }))}
          autoComplete="off"
        />
        {errorsCobertura.densidad && <div className="invalid-feedback d-block">{errorsCobertura.densidad}</div>}
      </div>

      <button
        className="btn btn-success w-100"
        onClick={guardarCobertura}
        title={cultivosDisponibles.length === 0 ? "Cargá semillas en Productos para habilitar" : ""}
        disabled={cultivosDisponibles.length === 0}
      >
        Registrar Cobertura
      </button>
    </>
  );
};

export default React.memo(FormCobertura);