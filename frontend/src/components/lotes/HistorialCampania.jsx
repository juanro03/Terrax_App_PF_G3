import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const HistorialCampania = () => {
  const { loteId } = useParams();
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/historial/${loteId}/`);
        setHistorial(response.data);
      } catch (error) {
        console.error("Error al obtener historial:", error);
      }
    };

    obtenerHistorial();
  }, [loteId]);

  return (
    <div className="container mt-4">
      <h4 className="fw-bold mb-4 text-success">Historial de Campañas</h4>
      {historial.length === 0 ? (
        <p className="text-muted">No hay campañas registradas aún para este lote.</p>
      ) : (
        <div className="row g-4">
          {historial.map((campania, index) => (
            <div key={index} className="col-md-6">
              <div className="card p-3 shadow-sm" style={{ borderRadius: "15px" }}>
                <h5 className="fw-bold mb-2">Campaña #{historial.length - index}</h5>
                <p className="mb-1"><strong>Siembra:</strong> {campania.cultivo} ({campania.variedad})</p>
                <p className="mb-1"><strong>Fecha de Siembra:</strong> {campania.fecha_siembra}</p>
                <p className="mb-1"><strong>Densidad:</strong> {campania.densidad} {campania.unidad_densidad}</p>
                <p className="mb-1"><strong>Ventana Cosecha:</strong> {campania.ventana_cosecha}</p>
                <hr />
                <p className="mb-1"><strong>Fecha de Cosecha:</strong> {campania.fecha_cosecha}</p>
                <p className="mb-1"><strong>Rinde:</strong> {campania.rinde}</p>

                {campania.archivo_rendimiento && (
                  <a
                    href={campania.archivo_rendimiento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success mt-2"
                  >
                    Ver archivo de rendimiento
                  </a>
                )}

                {campania.analisis_suelo && (
                  <a
                    href={campania.analisis_suelo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary mt-2 ms-2"
                  >
                    Ver análisis de suelo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialCampania;
