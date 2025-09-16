import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { BsPlusCircle, BsSearch } from "react-icons/bs";

/** Estética Terrax (mismo verde, botones/cuadros con esquinas cuadradas suaves) */
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
    <div
      className="terrax-card"
      style={{
        /** cartulina blanca más alta desde el inicio */
        minHeight: "80vh",
      }}
    >
      <div
        className="reportes-container"
        style={{ width: "100%", alignItems: "stretch", padding: 0 }}
      >
        {/* Título + subtítulo */}
        <div className="mb-4">
          <h2 className="terrax-title">Mis Productos</h2>
          <p
            className="text-muted"
            style={{ fontSize: "0.975rem", marginTop: "0.8rem" }}
          >
            Gestioná tu catálogo: consultá, filtrá o sumá nuevos ítems.
          </p>
        </div>

        {/* Tarjetas */}
        <Row className="g-4">
          {cards.map(({ title, desc, icon, route, primary }) => (
            <Col key={title} xs={12} md={6}>
              <article
                role="button"
                tabIndex={0}
                onClick={() => navigate(route)}
                onKeyDown={(e) => handleKey(e, route)}
                style={{
                  height: "100%",
                  borderRadius: "1rem",
                  border: `1px solid ${verde}20`,
                  background: primary ? blanco : grisClaro,
                  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
                  transition:
                    "transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease",
                  cursor: "pointer",
                  padding: "1rem 1.25rem",
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
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)";
                  e.currentTarget.style.border = `1px solid ${verde}20`;
                  e.currentTarget.style.background = primary
                    ? blanco
                    : grisClaro;
                }}
              >
                <div className="d-flex align-items-center">
                  {/* Icon chip */}
                  <div
                    className="me-3 me-sm-4 d-inline-flex align-items-center justify-content-center"
                    aria-hidden="true"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "12px", // cuadrado suave
                      background: verdeClaro,
                      color: verde,
                      boxShadow: "inset 0 0 0 2px rgba(25,135,84,.15)",
                      flexShrink: 0,
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

                      {/* “Abrir” como botón cuadrado outline en el mismo verde */}
                      <span
                        className="btn-terrax-outline"
                        style={{
                          padding: ".4rem .8rem",
                          lineHeight: 1,
                        }}
                        aria-hidden="true"
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
                </div>
              </article>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ProductosInicio;
