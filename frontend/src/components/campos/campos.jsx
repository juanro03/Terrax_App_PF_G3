import React, { useState, useEffect } from "react";
import "./styles.css"; // Asegurate de importar tu CSS personalizado
import axios from "../../axiosconfig"; // importá tu configuración de axios
import "@fontsource/poppins"; // estilo por defecto (400)
import "@fontsource/poppins/600.css"; // peso 600 si querés




export default function CampoCRUD() {
  const [form, setForm] = useState({
    nombre: "",
    provincia: "",
    localidad: "",
    cantidadLotes: "",
    imagen_satelital: null,
    observacion: "",
  });
  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const res = await axios.get("https://apis.datos.gob.ar/georef/api/provincias");
        const nombresProvincias = res.data.provincias.map((p) => p.nombre).sort();
        setProvincias(nombresProvincias);
      } catch (error) {
        console.error("Error al obtener provincias:", error);
      }
    };
  
    fetchProvincias();
  }, []);  
  useEffect(() => {
    const fetchLocalidades = async () => {
      if (form.provincia) {
        try {
          const res = await axios.get(
            `https://apis.datos.gob.ar/georef/api/localidades?provincia=${form.provincia}&max=1000`
          );
          const nombresLocalidades = res.data.localidades.map((l) => l.nombre).sort();
          setLocalidades(nombresLocalidades);
        } catch (error) {
          console.error("Error al obtener localidades:", error);
          setLocalidades([]);
        }
      } else {
        setLocalidades([]);
      }
    };
  
    fetchLocalidades();
  }, [form.provincia]);
  
  const [mensajeExito, setMensajeExito] = useState("");
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);


  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("provincia", form.provincia);
    formData.append("localidad", form.localidad);
    formData.append("cantidadLotes", form.cantidadLotes);
    formData.append("imagen_satelital", form.imagen_satelital);  // 👈 nombre correcto
    formData.append("observacion", form.observacion);
    
  
    try {
      await axios.post("http://127.0.0.1:8000/api/campos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMensajeExito("Campo registrado con éxito.");
      setForm({
        nombre: "",
        provincia: "",
        localidad: "",
        cantidadLotes: "",
        imagen_satelital: null,
        observacion: "",
      });
    
      // Hacer que el mensaje desaparezca después de unos segundos
      setTimeout(() => {
        setMensajeExito("");
      }, 6000);
    
    } catch (error) {
      console.error("Error al registrar campo:", error);
      alert("Ocurrió un error al enviar el formulario.");
    }
    
    
  };
  

  return (
    <div className="container-fluid">
      <div className="mb-3">
        <a href="http://localhost:3000/ver-campos" className="btn btn-outline-success">
          ← Ver Campos
        </a>
      </div>

      <h2>Registrar Campo</h2>
      {mensajeExito && (
        <div className="alert alert-success" role="alert">
          {mensajeExito}
        </div>
      )}


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
            {provincias.map((provincia, index) => (
              <option key={`${provincia}-${index}`} value={provincia}>
                {provincia}
              </option>
            ))}
          </select>
        </div>

        {/* Localidad */}
        <div className="row mb-3">
          <label htmlFor="localidad" className="form-label">
            Localidad
          </label>
          <select
            name="localidad"
            id="localidad"
            className="form-control"
            value={form.localidad}
            onChange={handleChange}
            required
            disabled={localidades.length === 0}
          >
            <option value="">Seleccionar</option>
            {localidades.map((localidad, index) => (
              <option key={`${localidad}-${index}`} value={localidad}>
                {localidad}
              </option>
            ))}

          </select>

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
          <label htmlFor="imagen_satelital" className="form-label">
            Imagen Satelital
          </label>
          <input
            type="file"
            name="imagen_satelital"
            id="imagen_satelital"
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
