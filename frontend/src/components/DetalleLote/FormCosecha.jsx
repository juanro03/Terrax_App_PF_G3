import React from "react";

const FormCosecha = ({
  cosecha,
  setCosecha,
  minFechaCosechaISO,
  openDatePicker,
  registrarCosecha,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        registrarCosecha();
      }}
    >
      {/* FECHA */}
      <div className="mb-2">
        <label className="form-label">Fecha</label>
        <input
          type="date"
          name="fecha"
          className="form-control"
          value={cosecha.fecha || ""}
          min={minFechaCosechaISO}
          onChange={(e) =>
            setCosecha((prev) => ({ ...prev, fecha: e.target.value }))
          }
          onClick={openDatePicker}
          required
        />
      </div>

      {/* RINDE */}
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
            autoComplete="off"
            required
          />
          <span
            className="input-group-text text-white"
            style={{
              height: "48px",
              backgroundColor: "#198754",
              border: "1px solid #198754",
            }}
          >
            Tn/Ha
          </span>
        </div>
      </div>

      {/* ARCHIVO OPCIONAL */}
      <div className="mb-2">
        <label className="form-label">Archivo de Rendimiento (opcional)</label>
        <input type="file" name="archivo" className="form-control" onChange={openDatePicker} />
      </div>

      <button className="btn btn-success w-100" type="submit">
        Registrar Cosecha
      </button>
    </form>
  );
};

export default React.memo(FormCosecha);
