import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Usuarios.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const VerUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/usuarios/");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsuarios();
  }, []);

  const handleEdit = (id) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await axios.delete(`http://localhost:8000/api/usuarios/${id}/`);
        setUsuarios(usuarios.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el usuario");
      }
    }
  };

  return (
    <div
      className="container-fluid"
      style={{ backgroundColor: "#f0f8ff", minHeight: "100vh", padding: "20px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Usuarios Registrados</h2>
        <button onClick={() => navigate("/usuarios/nuevo")} className="btn btn-success fw-bold">
          + Agregar Usuario
        </button>
      </div>

      <div className="row">
        {usuarios.map((user) => (
          <div key={user.id} className="card m-3 p-0 shadow" style={{ width: "18rem" }}>
            <div className="card-header bg-success text-white text-center fw-bold">
              {user.rol.toUpperCase()}
            </div>
            <div className="card-body text-center">
              <img
                src="/user.jpg"
                className="rounded-circle mb-3"
                alt="Perfil"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
              <h5 className="card-title text-dark">{user.first_name} {user.last_name}</h5>
              <p className="card-text text-dark">@{user.username}</p>
              <p className="card-text text-dark">{user.email}</p>
            </div>
            <div className="card-footer d-flex justify-content-around">
              <button className="btn btn-outline-primary" onClick={() => handleEdit(user.id)}>
                <FaEdit />
              </button>
              <button className="btn btn-outline-danger" onClick={() => handleDelete(user.id)}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerUsuarios;
