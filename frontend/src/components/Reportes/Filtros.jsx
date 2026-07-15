import React from "react";
import Select from "react-select";
import "./Filtros.css";

const Filtros = ({
  // data
  rol,
  opcionesUsuarios,
  opcionesCampos,
  opcionesLotes,
  opcionesFiltro,
  customStyles,
  // state
  usuarioSeleccionado,
  campoSeleccionado,
  loteSeleccionado,
  atributoFiltro,
  valorBusqueda,
  // handlers
  setUsuarioSeleccionado,
  setCampoSeleccionado,
  setLoteSeleccionado,
  setAtributoFiltro,
  setValorBusqueda,
}) => {
  return (
    <>
      {/* Buscador 
      <div className="filters-row">
        <div
          className="mb-3"
          style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}
        >
          <div style={{ width: "200px" }}>
            <Select
              classNamePrefix="rs"
              options={opcionesFiltro}
              value={opcionesFiltro.find((opt) => opt.value === atributoFiltro)}
              onChange={(opcion) => setAtributoFiltro(opcion.value)}
              styles={customStyles}
              isSearchable={false}
            />
          </div>

          <input
            type="text"
            placeholder={`Buscar por ${atributoFiltro}`}
            value={valorBusqueda}
            onChange={(e) => setValorBusqueda(e.target.value)}
            className="filter-input"
            style={{ width: "450px" }}
          />

          <button
            onClick={() => {
              setValorBusqueda("");
              setAtributoFiltro("nombre");
            }}
            className="btn btn-light"
            style={{ border: "1px solid #ced4da" }}
          >
            Limpiar
          </button>
        </div>
      </div>
      */}

      {/* Filtros */}
      <div className="filters-row">
        <div className="filtros">
          {rol === "admin" && (
            <div className="filtro" style={{ minWidth: 270 }}>
              <label>Usuario:</label>
              <Select
                classNamePrefix="rs"
                options={[{ value: "", label: "Todos" }, ...opcionesUsuarios]}
                value={
                  opcionesUsuarios.find((o) => o.value === usuarioSeleccionado) || {
                    value: "",
                    label: "Todos",
                  }
                }
                onChange={(opcion) => setUsuarioSeleccionado(opcion.value)}
                placeholder="Buscar usuario..."
                isSearchable
                styles={customStyles}
              />
            </div>
          )}

          <div className="filtro" style={{ minWidth: 260 }}>
            <label>Campo:</label>
            <Select
              classNamePrefix="rs"
              options={[{ value: "", label: "Todos" }, ...opcionesCampos]}
              value={
                opcionesCampos.find((o) => o.value === campoSeleccionado) || {
                  value: "",
                  label: "Todos",
                }
              }
              onChange={(opcion) => setCampoSeleccionado(opcion.value)}
              placeholder="Buscar campo..."
              isSearchable
              isDisabled={rol === "admin" && !usuarioSeleccionado}
              styles={customStyles}
            />
          </div>

          <div className="filtro" style={{ minWidth: 240 }}>
            <label>Lote:</label>
            <Select
              classNamePrefix="rs"
              options={[{ value: "", label: "Todos" }, ...opcionesLotes]}
              value={
                opcionesLotes.find((o) => o.value === loteSeleccionado) || {
                  value: "",
                  label: "Todos",
                }
              }
              onChange={(opcion) => setLoteSeleccionado(opcion.value)}
              placeholder="Buscar lote..."
              isSearchable
              isDisabled={!campoSeleccionado}
              styles={customStyles}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Filtros;
