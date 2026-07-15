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
  guardarSiembra,
  errorDensidad,
  setErrorDensidad,
  isEditing,
  canRegister,
}) => {
  const readOnly = !isEditing && !canRegister;

  const inputStyle = readOnly
    ? { backgroundColor: "#f3f3f3", cursor: "not-allowed" }
    : {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSiembra((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardarSiembra();
      }}
    >
      {/* FECHA */}
      <div className="mb-2">
        <label className="form-label">Fecha de Siembra</label>
        <input
          type="date"
          name="fecha"
          className="form-control"
          style={inputStyle}
          disabled={readOnly}
          readOnly={readOnly}
          value={siembra.fecha || ""}
          onChange={handleInputChange}
          onClick={openDatePicker}
          required
        />
      </div>

      {/* CULTIVO */}
      <div className="mb-2">
        <label className="form-label mb-0">Cultivo</label>
        <small className="text-muted d-block mb-1">
          (Registrar nuevos cultivos en la sección de productos)
        </small>

        {!siembra.modoCultivoLibre ? (
          <select
            name="cultivo"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            value={siembra.cultivo || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "__otro__") {
                setSiembra((prev) => ({
                  ...prev,
                  cultivo: "",
                  variedad: "",
                  dias_madurez_manual: "",
                  modoCultivoLibre: true,
                }));
                return;
              }
              setSiembra((prev) => ({
                ...prev,
                cultivo: value,
                variedad: "",
                modoCultivoLibre: false,
              }));
            }}
            required={!siembra.modoCultivoLibre}
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
              value={siembra.cultivo}
              onChange={handleInputChange}
              required
            />

            {!readOnly && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  setSiembra((prev) => ({
                    ...prev,
                    modoCultivoLibre: false,
                    cultivo: "",
                    variedad: "",
                    dias_madurez_manual: "",
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

        {siembra.modoCultivoLibre ? (
          <input
            type="text"
            name="variedad"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            placeholder="Ingresá la variedad"
            value={siembra.variedad || ""}
            onChange={handleInputChange}
            required
          />
        ) : (
          <select
            name="variedad"
            className="form-control"
            style={inputStyle}
            disabled={readOnly || !siembra.cultivo}
            readOnly={readOnly}
            value={siembra.variedad || ""}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccionar variedad</option>
            {variedadesDisponibles.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* DIAS MADURACION */}
      {siembra.modoCultivoLibre && (
        <div className="mb-2">
          <label className="form-label">Días de maduración</label>
          <input
            type="number"
            name="dias_madurez_manual"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            placeholder="Ej: 120"
            value={siembra.dias_madurez_manual || ""}
            onChange={handleInputChange}
            required
          />
        </div>
      )}

      {/* DENSIDAD */}
      <div className="mb-2">
        <label className="form-label mb-0">Densidad de siembra</label>

        {errorDensidad && (
          <div className="form-text text-danger">{errorDensidad}</div>
        )}

        <div className="input-group">
          <input
            type="text"
            name="densidad"
            className="form-control"
            style={inputStyle}
            disabled={readOnly}
            readOnly={readOnly}
            value={siembra.densidad || ""}
            placeholder="Ej: 120,5"
            onChange={(e) => {
              let valor = e.target.value.replace(".", ",");
              setSiembra((p) => ({ ...p, densidad: valor }));
              setErrorDensidad("");
            }}
            required
          />

          <button
            type="button"
            disabled={readOnly}
            className={`btn ${
              unidadDensidad === "Kg/Ha"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            style={{ height: "45px" }}
            onClick={() => {
              setUnidadDensidad("Kg/Ha");
              setSiembra((p) => ({ ...p, unidad: "Kg/Ha" }));
            }}
          >
            Kg/Ha
          </button>

          <button
            type="button"
            disabled={readOnly}
            className={`btn ${
              unidadDensidad === "Pl/Ha"
                ? "btn-success"
                : "btn-outline-success"
            }`}
            style={{ height: "45px" }}
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
        <label className="form-label mb-0">Fecha estimada de cosecha</label>
        <small className="text-muted d-block">(Se calcula automáticamente)</small>
        <input
          type="text"
          className="form-control"
          style={{ backgroundColor: "#f3f3f3" }}
          readOnly
          value={siembra.fechaEstimadaCosecha || ""}
        />
      </div>

      {/* ANALISIS */}
      <div className="mb-2">
        <label className="form-label">Análisis de suelo (opcional)</label>
        <input
          type="file"
          className="form-control"
          style={inputStyle}
          disabled={readOnly}
          readOnly={readOnly}
          onChange={(e) =>
            setSiembra((prev) => ({
              ...prev,
              analisisSuelo: e.target.files[0],
            }))
          }
        />
      </div>

      {/* BOTÓN REGISTRAR */}
      {canRegister && !isEditing && (
        <button className="btn btn-success w-100 mt-2" type="submit">
          Registrar Siembra
        </button>
      )}
    </form>
  );
};

export default React.memo(FormSiembra);
