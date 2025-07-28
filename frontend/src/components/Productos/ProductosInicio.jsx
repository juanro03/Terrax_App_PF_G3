import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { BsPlusCircle, BsSearch } from "react-icons/bs";
import "../../App.css";

const ProductosInicio = () => {
  const navigate = useNavigate();

  const cardData = [
    {
      title: "Ver Mis Productos",
      icon: <BsSearch size={48} />,
      route: "/productos/ver",
      bg: "light",
    },
    {
      title: "Agregar Productos",
      icon: <BsPlusCircle size={48} color="#3aa37c" />,
      route: "/productos/agregar",
      bg: "light",
    },
  ];

  return (
    <Container fluid className="mt-5">
      <h2 className="text-center mb-4">Mis Productos</h2>
      <Row className="justify-content-center gx-4 gy-4">
        {cardData.map(({ title, icon, route, bg }) => (
          <Col key={title} xs={12} sm={6} md={4} lg={3}>
            <Card
              bg={bg}
              onClick={() => navigate(route)}
              className="py-5 h-100 shadow-sm hover-scale text-center"
              style={{ cursor: "pointer", borderRadius: "12px" }}
            >
              <Card.Body>
                <div className="mb-3 icon-container">{icon}</div>
                <Card.Title className="fw-bold" style={{ fontSize: "1.15rem" }}>
                  {title}
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ProductosInicio;
