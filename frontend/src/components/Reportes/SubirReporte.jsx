import React, { useState, useEffect } from "react";
import axios from "axios";
import "./reportes.css";

const SubirReporte = () => {
  const [campos, setCampos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState("");
  const [nombre, setNombre] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("accessToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/campos/", { headers })
      .then((res) => setCampos(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (campoSeleccionado) {
      axios
        .get(
          `http://127.0.0.1:8000/api/lotes/por-campo/${campoSeleccionado}/lotes`,
          { headers }
        )
        .then((res) => setLotes(res.data))
        .catch((err) => console.error(err));
    } else {
      setLotes([]);
      setLoteSeleccionado("");
    }
  }, [campoSeleccionado]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !campoSeleccionado || !loteSeleccionado || !archivo) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("campo", campoSeleccionado);
    formData.append("lote", loteSeleccionado);
    formData.append("observaciones", observaciones);
    formData.append("archivo_pdf", archivo);

    try {
      await axios.post("http://127.0.0.1:8000/api/reportes/", formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });
      setMensaje("✅ Reporte subido con éxito.");
      setNombre("");
      setObservaciones("");
      setArchivo(null);
      setCampoSeleccionado("");
      setLoteSeleccionado("");
    } catch (error) {
      console.error(error);
      setMensaje("Error al subir el reporte.");
    }
  };

  return (
    <div className="reportes-container">
      <h2 className="text-3xl font-bold mb-4">Subir Reporte</h2>

      {mensaje && <p className="mb-4 text-sm text-red-600">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="espaciado-form">
        <div className="form-group">
          <label>Campo:</label>
          <select
            value={campoSeleccionado}
            onChange={(e) => setCampoSeleccionado(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">Seleccionar campo</option>
            {campos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Lote:</label>
          <select
            value={loteSeleccionado}
            onChange={(e) => setLoteSeleccionado(e.target.value)}
            className="p-2 border rounded w-full"
            disabled={!campoSeleccionado}
          >
            <option value="">Seleccionar lote</option>
            {lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nombre del reporte:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="form-group">
          <label>Observaciones:</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="p-2 border rounded w-full"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Archivo PDF:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setArchivo(e.target.files[0])}
            className="p-2 border rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Subir Reporte
        </button>
      </form>
    </div>
  );
};

export default SubirReporte;
