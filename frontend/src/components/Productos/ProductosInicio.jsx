import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col } from "react-bootstrap";
import { BsPlusCircle, BsSearch } from "react-icons/bs";

// PALETA
const verde = "#198754";
const verdeClaro = "#e9fbe5";
const verdeOscuro = "#155a36";
const grisClaro = "#f3f6f5";
const blanco = "#fff";

const ProductosInicio = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Ver mis productos",
      desc: "Listado completo, filtros y búsqueda",
      icon: <BsSearch size={26} />,
      route: "/productos/ver",
      primary: false,
    },
    {
      title: "Agregar productos",
      desc: "Crea nuevos registros por categoría",
      icon: <BsPlusCircle size={26} />,
      route: "/productos/agregar",
      primary: true,
    },
  ];

  const handleKey = (e, route) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(route);
    }
  };

  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{
        maxWidth: 1160,
        background: blanco,
        borderRadius: "1.4rem",
        border: "none",
      }}
    >
      <Card.Body className="p-4 p-sm-5">
        {/* Título + subtítulo */}
        <div className="mb-5">
          <h2 className="fw-bold" style={{ color: verdeOscuro }}>
            Mis Productos
          </h2>
          <p
            className="text-muted"
            style={{
              fontSize: "0.975rem",
              marginTop: "0.8rem", // 👈 separa más el subtítulo del título
            }}
          >
            Gestioná tu catálogo: consultá, filtrá o sumá nuevos ítems.
          </p>
        </div>

        {/* Tarjetas */}
        <Row className="g-4">
          {cards.map(({ title, desc, icon, route, primary }) => (
            <Col key={title} xs={12} md={6}>
              <Card
                role="button"
                tabIndex={0}
                onClick={() => navigate(route)}
                onKeyDown={(e) => handleKey(e, route)}
                className="shadow-sm"
                style={{
                  height: "100%",
                  borderRadius: "1.2rem",
                  border: `1px solid ${verde}20`,
                  background: primary ? "#fefefe" : grisClaro,
                  transition:
                    "transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 28px rgba(0,0,0,.08)";
                  e.currentTarget.style.border = `1px solid ${verde}55`;
                  e.currentTarget.style.background = blanco;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.border = `1px solid ${verde}20`;
                  e.currentTarget.style.background = primary
                    ? "#fefefe"
                    : grisClaro;
                }}
              >
                <Card.Body className="p-4 d-flex align-items-center">
                  {/* Icon chip */}
                  <div
                    className="me-3 me-sm-4 d-inline-flex align-items-center justify-content-center"
                    aria-hidden="true"
                    style={{
                      minWidth: 56,
                      minHeight: 56,
                      borderRadius: 16,
                      background: verdeClaro,
                      color: verde,
                      boxShadow: "inset 0 0 0 2px rgba(25,135,84,.15)",
                    }}
                  >
                    {icon}
                  </div>

                  {/* Textos */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                      <h5
                        className="fw-bold mb-1"
                        style={{ color: verdeOscuro, letterSpacing: ".1px" }}
                      >
                        {title}
                      </h5>
                      <span
                        className="px-3 py-1 rounded-pill"
                        style={{
                          fontSize: ".8rem",
                          fontWeight: 600,
                          background: verdeClaro,
                          color: verdeOscuro,
                          border: `1px solid ${verde}33`,
                        }}
                      >
                        Abrir
                      </span>
                    </div>
                    <p
                      className="mb-0 mt-2 text-muted"
                      style={{ fontSize: ".95rem", lineHeight: 1.35 }}
                    >
                      {desc}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProductosInicio;
