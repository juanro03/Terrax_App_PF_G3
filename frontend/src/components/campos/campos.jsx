import React, { useState } from "react";
import "./styles.css"; // Asegurate de importar tu CSS personalizado

export default function CampoCRUD() {
  const [form, setForm] = useState({
    nombre: "",
    provincia: "",
    localidad: "",
    cantidadLotes: "",
    imagenSatelital: null,
    observacion: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    console.log("Formulario enviado:", formData);
    alert("Formulario enviado. Revisá consola para ver los datos.");
  };

  return (
    <div className="container-fluid">
      <h2>Registrar Campo</h2>
      <form
        onSubmit={handleSubmit}
        className="form-card w-100"
        encType="multipart/form-data"
      >
        {/* Nombre */}
        <div className="row mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            id="nombre"
            className="form-control"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Provincia */}
        <div className="row mb-3">
          <label htmlFor="provincia" className="form-label">
            Provincia
          </label>
          <select
            name="provincia"
            id="provincia"
            className="form-control"
            value={form.provincia}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar</option>
            <option value="Buenos Aires">Buenos Aires</option>
            <option value="Córdoba">Córdoba</option>
            <option value="Santa Fe">Santa Fe</option>
            <option value="Mendoza">Mendoza</option>
          </select>
        </div>

        {/* Localidad */}
        <div className="row mb-3">
          <label htmlFor="localidad" className="form-label">
            Localidad
          </label>
          <input
            type="text"
            name="localidad"
            id="localidad"
            className="form-control"
            value={form.localidad}
            onChange={handleChange}
            required
          />
        </div>

        {/* Cantidad de Lotes */}
        <div className="row mb-3">
          <label htmlFor="cantidadLotes" className="form-label">
            Cantidad de Lotes
          </label>
          <input
            type="number"
            name="cantidadLotes"
            id="cantidadLotes"
            className="form-control"
            value={form.cantidadLotes}
            onChange={handleChange}
            required
          />
        </div>

        {/* Imagen Satelital */}
        <div className="row mb-3">
          <label htmlFor="imagenSatelital" className="form-label">
            Imagen Satelital
          </label>
          <input
            type="file"
            name="imagenSatelital"
            id="imagenSatelital"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* Observaciones */}
        <div className="row mb-3">
          <label htmlFor="observacion" className="form-label">
            Observaciones
          </label>
          <textarea
            name="observacion"
            id="observacion"
            className="form-control"
            value={form.observacion}
            onChange={handleChange}
          />
        </div>

        {/* Botón guardar */}
        <button type="submit" className="btn-guardar">
          Guardar Campo
        </button>
      </form>
    </div>
  );
}
