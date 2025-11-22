import React from "react";

const FormCosecha = ({
  cosecha,
  setCosecha,
  minFechaCosechaISO,
  openDatePicker,
  registrarCosecha,
  errorRinde,
  setErrorRinde
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
        <label className="form-label mb-0">Fecha de cosecha</label>
        <small className="text-muted d-block mb-2">(por defecto se establece la fecha estimada de cosecha)</small>
        <input
          type="date"
          name="fecha"
          className="form-control"
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
          <div className="form-text text-danger mt-0 mb-2">{errorRinde}</div>
        )}
        <div className="input-group">
          <input
            type="text"
            name="rinde"
            className="form-control"
            value={cosecha.rinde || ""}
            placeholder="Ejemplo: 7,5"
            onChange={(e) => {
              let valor = e.target.value;

              // CONVERSIÓN AUTOMÁTICA: punto → coma
              valor = valor.replace(".", ",");

              // permitir escritura libre
              setCosecha(prev => ({ ...prev, rinde: valor }));

              // limpiar error mientras escribe
              setErrorRinde("");
            }}
            onBlur={() => {
              // VALIDACIÓN FINAL (solo al salir)
              const r = (cosecha.rinde || "").trim();
              const rindeRegex = /^\d+(,\d{1,2})?$/; // acepta 7,5 / 12,25 / 8

              if (!rindeRegex.test(r)) {
                setErrorRinde("Formato inválido. Use coma decimal. Ej: 7,5");
              }
            }}
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
