import React, { useEffect, useState } from "react";
import axios from "../../axiosconfig";
import "./styles.css"; // asegúrate de tener estilos compatibles o crea clases nuevas

const VerCampos = () => {
  const [campos, setCampos] = useState([]);

  useEffect(() => {
    const fetchCampos = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/campos/");
        setCampos(response.data);
      } catch (error) {
        console.error("Error al obtener los campos:", error);
      }
    };

    fetchCampos();
  }, []);

  return (
    <div className="container-fluid" style={{ backgroundColor: "#e8fdf0", minHeight: "100vh", padding: "20px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="m-0 fw-bold">Campos Registrados</h2>
            <a href="http://localhost:3000/campos" className="btn btn-success fw-bold">
            + Agregar Campo
            </a>
        </div>
      <div className="row justify-content-center">
      <div className="container mt-4">
        <div className="row">
            {campos.map((campo) => (
            <div key={campo.id} className="card m-3 p-0 shadow" style={{ width: "18rem" }}>
                <div className="card-header bg-success text-white text-center fw-bold">
                <div className="card-body">
                    <h5 className="card-title">Campo {campo.nombre}</h5>
                    <p className="card-text">{campo.provincia}, {campo.localidad} </p>
                </div>
                {campo.imagen_satelital && (
                    <img
                    src={campo.imagen_satelital}
                    alt={`Imagen del campo ${campo.nombre}`}
                    className="card-img-bottom"
                    style={{ height: "200px", objectFit: "cover", borderTop: "1px solid #ccc" }}
                    />
                )}
                </div>
            </div>
            ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default VerCampos;
