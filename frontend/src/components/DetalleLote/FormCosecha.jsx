import React from "react";

const FormCosecha = ({
  cosecha,
  setCosecha,
  minFechaCosechaISO,
  openDatePicker,
  registrarCosecha,
  errorRinde,
  setErrorRinde,
  errorsCosecha,
  isEditing,
  canRegister
}) => {
  const readOnly = !isEditing && !canRegister;

  const inputStyle = readOnly
    ? { backgroundColor: "#f3f3f3", cursor: "not-allowed" }
    : {};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        registrarCosecha();
      }}
    >
      {/* FECHA */}
      <div className="mb-2">
        <label className="form-label mb-0">Fecha de cosecha</label>
        <small className="text-muted d-block mb-2">
          (por defecto se establece la fecha estimada de cosecha)
        </small>

        {errorsCosecha?.fecha && (
          <div className="form-text text-danger">{errorsCosecha.fecha}</div>
        )}

        <input
          type="date"
          name="fecha"
          className="form-control"
          style={inputStyle}
          disabled={readOnly}
          readOnly={readOnly}
          value={cosecha.fecha || ""}
          onChange={(e) =>
            setCosecha((prev) => ({ ...prev, fecha: e.target.value }))
          }
          onClick={openDatePicker}
          required
        />
      </div>

      {/* RINDE */}
      <div className="mb-2">
        <label className="form-label mb-0">Rinde</label>

        {errorRinde && (
          <div className="form-text text-danger">{errorRinde}</div>
        )}

        <div className="input-group">
          <input
            type="text"
            name="rinde"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            value={cosecha.rinde || ""}
            placeholder="Ejemplo: 7,5"
            onChange={(e) => {
              let valor = e.target.value.replace(".", ",");
              setCosecha((prev) => ({ ...prev, rinde: valor }));
              setErrorRinde("");
            }}
            autoComplete="off"
            required
          />

          <span
            className="input-group-text text-white"
            style={{
              height: "45px",
              backgroundColor: readOnly ? "#ccc" : "#198754",
              border: "1px solid #198754",
            }}
          >
            Tn/Ha
          </span>
        </div>
      </div>

      {/* ARCHIVO */}
      <div className="mb-2">
        <label className="form-label">Archivo de Rendimiento (opcional)</label>
        <input
          type="file"
          name="archivo"
          className="form-control"
          style={inputStyle}
          disabled={readOnly}
          readOnly={readOnly}
          onChange={(e) =>
            setCosecha((prev) => ({ ...prev, archivo: e.target.files[0] }))
          }
        />
      </div>

      {/* BOTÓN REGISTRAR */}
      {canRegister && !isEditing && (
        <button className="btn btn-success w-100" type="submit">
          Registrar Cosecha
        </button>
      )}
    </form>
  );
};

export default React.memo(FormCosecha);
