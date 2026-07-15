import React from "react";

const FormCobertura = ({
  cobertura,
  setCobertura,
  cultivosDisponibles,
  variedadesDisponibles,
  openDatePicker,
  errorsCobertura,
  guardarCobertura,
  errorDensidadCobertura,
  setErrorDensidadCobertura,
  isEditing,
  canRegister,
  handleChangeCobertura
}) => {
  const readOnly = !isEditing && !canRegister;

  const inputStyle = readOnly
    ? { backgroundColor: "#f3f3f3", cursor: "not-allowed" }
    : {};

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCobertura((p) => ({ ...p, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardarCobertura();
      }}
    >
      {/* FECHA */}
      <div className="mb-2">
        <label className="form-label">Fecha de cobertura</label>
        <input
          type="date"
          name="fecha"
          className="form-control"
          style={inputStyle}
          disabled={readOnly}
          readOnly={readOnly}
          value={cobertura.fecha || ""}
          onChange={handleInput}
          onClick={openDatePicker}
          required
        />
      </div>

      {/* CULTIVO */}
      <div className="mb-2">
        <label className="form-label mb-0">Cultivo</label>
        <small className="text-muted">(Registrar nuevos cultivos en productos)</small>

        {!cobertura.modoCultivoLibre ? (
          <select
            name="cultivo"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            value={cobertura.cultivo || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (readOnly) return;

              if (value === "__otro__") {
                setCobertura((p) => ({
                  ...p,
                  cultivo: "",
                  variedad: "",
                  modoCultivoLibre: true,
                }));
                return;
              }

              setCobertura((p) => ({
                ...p,
                cultivo: value,
                variedad: "",
                modoCultivoLibre: false,
              }));
            }}
            required={!cobertura.modoCultivoLibre}
          >
            <option value="">Seleccionar cultivo</option>
            {cultivosDisponibles.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
            <option value="__otro__">➕ Registrar otro cultivo</option>
          </select>
        ) : (
          <>
            <input
              type="text"
              name="cultivo"
              className="form-control mb-2"
              style={inputStyle}
              disabled={readOnly}
              readOnly={readOnly}
              placeholder="Ingresá el cultivo"
              value={cobertura.cultivo || ""}
              onChange={handleInput}
              required
            />

            {!readOnly && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setCobertura((p) => ({
                    ...p,
                    modoCultivoLibre: false,
                    cultivo: "",
                    variedad: "",
                  }))
                }
              >
                Volver a selección
              </button>
            )}
          </>
        )}
      </div>

      {/* VARIEDAD */}
      <div className="mb-2">
        <label className="form-label">Variedad</label>

        {cobertura.modoCultivoLibre ? (
          <input
            type="text"
            name="variedad"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            placeholder="Ingresá la variedad"
            value={cobertura.variedad || ""}
            onChange={handleInput}
            required
          />
        ) : (
          <select
            name="variedad"
            className="form-control"
            style={inputStyle}
            disabled={readOnly || !cobertura.cultivo}
            readOnly={readOnly}
            value={cobertura.variedad || ""}
            onChange={handleInput}
            required
          >
            <option value="">Seleccionar variedad</option>
            {variedadesDisponibles.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}
            <option value="__otra_var__">➕ Registrar otra variedad</option>
          </select>
        )}
      </div>

      {/* INPUT TEXTO EXTRA */}
      {cobertura.variedad === "__otra_var__" && (
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            placeholder="Ingresá la variedad"
            value={cobertura.variedadTextoLibre || ""}
            onChange={(e) =>
              setCobertura((p) => ({
                ...p,
                variedadTextoLibre: e.target.value,
                variedad: e.target.value,
              }))
            }
            required
          />
        </div>
      )}

      {/* DENSIDAD */}
      <div className="mb-2">
        <label className="form-label mb-0">Densidad</label>

        {errorDensidadCobertura && (
          <div className="form-text text-danger">{errorDensidadCobertura}</div>
        )}

        <div className="input-group">
          <input
            type="text"
            name="densidad"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            value={cobertura.densidad || ""}
            placeholder="Ej: 80,5"
            onChange={(e) => {
              let valor = e.target.value.replace(".", ",");
              setCobertura((p) => ({ ...p, densidad: valor }));
              setErrorDensidadCobertura("");
            }}
            required
          />

          <span
            className="input-group-text"
            style={{
              height: "45px",
              backgroundColor: readOnly ? "#ccc" : "#198754",
              color: "white",
              border: "1px solid #198754",
            }}
          >
            Kg/Ha
          </span>
        </div>
      </div>

      {/* BOTÓN REGISTRAR */}
      {canRegister && !isEditing && (
        <button className="btn btn-success w-100 mt-2" type="submit">
          Registrar Cobertura
        </button>
      )}
    </form>
  );
};

export default React.memo(FormCobertura);
