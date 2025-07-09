import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card } from "react-bootstrap";
import { BsPlusCircle, BsSearch } from "react-icons/bs";
import "../../App.css"; // Asegurate de importar los estilos

const ProductosInicio = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5 text-center">
      <h2 className="fw-bold mb-4">Mis Productos</h2>

      <div className="d-flex justify-content-center flex-wrap gap-4">
        <Card
          onClick={() => navigate("/productos/ver")}
          className="p-4 shadow rounded-4 text-center card-hover"
          style={{ cursor: "pointer", width: "250px" }}
        >
          <h5 className="fw-bold mb-3">Ver Mis Productos</h5>
          <div className="d-flex justify-content-center">
            <BsSearch size={64} className="icon-hover" />
          </div>
        </Card>

        <Card
          onClick={() => navigate("/productos/agregar")}
          className="p-4 shadow rounded-4 text-center card-hover"
          style={{ cursor: "pointer", width: "250px" }}
        >
          <h5 className="fw-bold mb-3">Agregar Productos</h5>
          <div className="d-flex justify-content-center">
            <BsPlusCircle size={64} color="#3aa37c" className="icon-hover" />
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default ProductosInicio;
