import React from "react";

const FormCobertura = ({
  cobertura,
  setCobertura,
  cultivosDisponibles,
  variedadesDisponibles,
  openDatePicker,
  guardarCobertura,
  errorDensidadCobertura,
  setErrorDensidadCobertura
}) => {

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
        <label className="form-label">Fecha de Siembra</label>
        <input
          type="date"
          name="fecha"
          className="form-control"
          value={cobertura.fecha || ""}
          onChange={handleInput}
          onClick={openDatePicker}
          required
        />
      </div>

      {/* CULTIVO */}
      <div className="mb-2">
        <label className="form-label mb-0">Cultivo</label>
        <small className="text-muted d-block mb-1">(Registrar nuevos cultivos en la sección de productos)</small>
        {!cobertura.modoCultivoLibre ? (
          <select
            name="cultivo"
            className="form-control"
            value={cobertura.cultivo || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "__otro__") {
                setCobertura((p) => ({
                  ...p,
                  cultivo: "",
                  variedad: "",
                  modoCultivoLibre: true
                }));
                return;
              }

              setCobertura((p) => ({
                ...p,
                cultivo: value,
                variedad: "",
                modoCultivoLibre: false
              }));
            }}
            required={!cobertura.modoCultivoLibre}
          >
            <option value="">Seleccionar cultivo</option>

            {cultivosDisponibles.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}

            <option value="__otro__">➕ Registrar otro cultivo</option>
          </select>

        ) : (
          <>
            <input
              type="text"
              name="cultivo"
              className="form-control mb-2"
              placeholder="Ingresá el cultivo"
              value={cobertura.cultivo || ""}
              onChange={handleInput}
              required
            />

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() =>
                setCobertura((p) => ({
                  ...p,
                  modoCultivoLibre: false,
                  cultivo: "",
                  variedad: ""
                }))
              }
            >
              Volver a selección
            </button>
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
            placeholder="Ingresá la variedad"
            value={cobertura.variedad || ""}
            onChange={handleInput}
            required
          />

        ) : (
          <select
            name="variedad"
            className="form-control"
            value={cobertura.variedad || ""}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "__otra_var__") {
                setCobertura(p => ({
                  ...p,
                  variedadTextoLibre: "",
                  variedad: "__otra_var__"
                }));
                return;
              }

              handleInput(e);
            }}
            disabled={!cobertura.cultivo}
            required
          >
            <option value="">Seleccionar variedad</option>

            {variedadesDisponibles.map((v, i) => (
              <option key={i} value={v}>{v}</option>
            ))}

            <option value="__otra_var__">➕ Registrar otra variedad</option>
          </select>
        )}
      </div>

      {/* INPUT cuando elige "Registrar otra variedad" */}
      {cobertura.variedad === "__otra_var__" && (
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Ingresá la variedad"
            value={cobertura.variedadTextoLibre || ""}
            onChange={(e) =>
              setCobertura((p) => ({
                ...p,
                variedadTextoLibre: e.target.value,
                variedad: e.target.value
              }))
            }
            required
          />
        </div>
      )}

      {/* DENSIDAD (idéntico a siembra) */}
      <div className="mb-2">
        <label className="form-label mb-0">Densidad de Siembra</label>

        {errorDensidadCobertura && (
          <div className="form-text text-danger mt-0 mb-2">
            {errorDensidadCobertura}
          </div>
        )}
        <div className="input-group">
          <input
            type="text"
            name="densidad"
            className="form-control"
            value={cobertura.densidad || ""}
            placeholder="Ejemplo: 80,5"
            onChange={(e) => {
              let valor = e.target.value.replace(".", ",");
              setCobertura((p) => ({ ...p, densidad: valor }));
              setErrorDensidadCobertura("");
            }}
            onBlur={() => {
              const d = (cobertura.densidad || "").trim();
              const regex = /^\d+(,\d{1,2})?$/;

              if (d === "") return;
              if (!regex.test(d)) {
                setErrorDensidadCobertura("Formato inválido. Use coma decimal. Ej: 80,5");
              }
            }}
            autoComplete="off"
            required
          />

          <button
            type="button"
            className={"btn btn-success"}
            style={{ height: "48px" }}
          >
            Kg/Ha
          </button>
        </div>
      </div>

      <button className="btn btn-success w-100 mt-2" type="submit">
        Registrar Cobertura
      </button>
    </form>
  );
};

export default React.memo(FormCobertura);
