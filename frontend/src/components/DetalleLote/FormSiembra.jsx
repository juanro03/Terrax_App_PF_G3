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
  setErrorDensidad
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSiembra(prev => ({ ...prev, [name]: value }));
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
          value={siembra.fecha || ""}
          onChange={handleInputChange}
          onClick={openDatePicker}
          required
        />
      </div>

      {/* CULTIVO */}
      <div className="mb-2">
        <label className="form-label mb-0">Cultivo</label>
        <small className="text-muted d-block mb-1">(Registrar nuevos cultivos en la sección de productos)</small>
        {!siembra.modoCultivoLibre ? (
          <select
            name="cultivo"
            className="form-control"
            value={siembra.cultivo || ""}
            onChange={(e) => {
              const value = e.target.value;

              // Si selecciona "otro", habilitamos modo libre
              if (value === "__otro__") {
                setSiembra(prev => ({
                  ...prev,
                  cultivo: "",
                  variedad: "",
                  dias_madurez_manual: "",
                  modoCultivoLibre: true
                }));
                return;
              }

              // Seleccionó un cultivo normal
              setSiembra(prev => ({
                ...prev,
                cultivo: value,
                variedad: "",
                modoCultivoLibre: false
              }));
            }}
            required={!siembra.modoCultivoLibre}
          >
            <option value="">Seleccionar cultivo</option>
            {cultivosDisponibles.map((cultivo, i) => (
              <option key={i} value={cultivo}>{cultivo}</option>
            ))}

            {/* Opción especial */}
            <option value="__otro__">➕ Registrar otro cultivo</option>
          </select>

        ) : (
          <>
            <input
              type="text"
              name="cultivo"
              className="form-control mb-2"
              placeholder="Ingresá el cultivo"
              value={siembra.cultivo}
              onChange={handleInputChange}
              required
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() =>
                setSiembra(prev => ({
                  ...prev,
                  modoCultivoLibre: false,
                  cultivo: "",
                  variedad: "",
                  dias_madurez_manual: ""
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

        {siembra.modoCultivoLibre ? (
          <input
            type="text"
            name="variedad"
            className="form-control"
            placeholder="Ingresá la variedad"
            value={siembra.variedad || ""}
            onChange={handleInputChange}
            required
          />
        ) : (
          <select
            name="variedad"
            className="form-control"
            value={siembra.variedad || ""}
            onChange={handleInputChange}
            disabled={!siembra.cultivo}
            required
          >
            <option value="">Seleccionar variedad</option>
            {variedadesDisponibles.map((variedad, i) => (
              <option key={i} value={variedad}>{variedad}</option>
            ))}
          </select>
        )}

      </div>

      {/* DIAS MADURACION (solo modo libre) */}
      {siembra.modoCultivoLibre && (
        <div className="mb-2">
          <label className="form-label">Días de maduración</label>
          <input
            type="number"
            name="dias_madurez_manual"
            className="form-control"
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
          <div className="form-text text-danger mt-0 mb-2">{errorDensidad}</div>
        )}

        <div className="input-group">
          <input
            type="text"
            name="densidad"
            className="form-control"
            value={siembra.densidad || ""}
            placeholder="Ejemplo: 120,5"
            onChange={(e) => {
              let valor = e.target.value.replace(".", ",");
              setSiembra(prev => ({ ...prev, densidad: valor }));
              setErrorDensidad("");
            }}
            onBlur={() => {
              const d = (siembra.densidad || "").trim();
              const regex = /^\d+(,\d{1,2})?$/;

              if (d === "") return;
              if (!regex.test(d)) {
                setErrorDensidad("Formato inválido. Use coma decimal. Ej: 120,5");
              }
            }}
            required
          />

          <button
            type="button"
            className={`btn ${unidadDensidad === "Kg/Ha" ? "btn-success" : "btn-outline-success"}`}
            style={{ height: "48px" }}
            onClick={() => {
              setUnidadDensidad("Kg/Ha");
              setSiembra(p => ({ ...p, unidad: "Kg/Ha" }));
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
              setSiembra(p => ({ ...p, unidad: "Pl/Ha" }));
            }}
          >
            Pl/Ha
          </button>
        </div>
      </div>

      {/* FECHA ESTIMADA */}
      <div className="mb-2">
        <label className="form-label mb-0">Fecha estimada de cosecha</label>
        <small className="text-muted d-block mb-2">
          (Se calcula automáticamente)
        </small>
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
          onChange={(e) =>
            setSiembra(prev => ({ ...prev, analisisSuelo: e.target.files[0] }))
          }
        />
      </div>

      <button className="btn btn-success w-100 mt-2" type="submit">
        Registrar Siembra
      </button>
    </form>
  );
};

export default React.memo(FormSiembra);
