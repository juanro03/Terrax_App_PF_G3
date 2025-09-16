import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft } from "react-icons/fa";

// === PALETA / TOKENS (consistente Terrax)
const verde = "#198754";
const verdeClaro = "#e9fbe5";
const verdeOscuro = "#155a36";
const grisClaro = "#f3f6f5";
const blanco = "#fff";
const grisOscuro = "#424242";

const categorias = [
  { nombre: "COADYUVANTES" },
  { nombre: "FERTILIZANTES" },
  { nombre: "AGROQUIMICOS" },
  { nombre: "SEMILLAS" },
];

const ProductosLista = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("COADYUVANTES");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios
      .get("http://localhost:8000/api/productos/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProductos(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los productos");
        setLoading(false);
      });
  }, []);

  const handleEliminar = async (id) => {
    const confirmacion = window.confirm(
      "¿Estás seguro que deseas eliminar este producto?"
    );
    if (!confirmacion) return;

    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(`http://localhost:8000/api/productos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar el producto", err);
      alert("No se pudo eliminar el producto.");
    }
  };

  const productosFiltrados = productos.filter(
    (prod) => prod.categoria === categoriaSeleccionada
  );

  return (
    <div className="terrax-card" style={{ minHeight: "85vh" }}>
      <Card.Body className="d-flex flex-column h-100">
        {/* Título */}
        <Card.Title className="fw-bold mb-4" style={{ color: verdeOscuro }}>
          Mis Productos — {categoriaSeleccionada}
        </Card.Title>

        <Row className="g-4 flex-grow-1 align-items-stretch">
          {/* Sidebar categorías */}
          <Col md="auto" className="d-flex">
            <Card
              className="p-3 shadow-sm h-100 flex-fill"
              style={{
                width: 260,
                borderRadius: "1.2rem",
                border: `1px solid ${verde}20`,
                background: "#f9faf9",
              }}
            >
              <h6
                className="text-center fw-bold mb-3"
                style={{ color: verdeOscuro }}
              >
                Categorías
              </h6>

              {categorias.map((cat) => {
                const active = categoriaSeleccionada === cat.nombre;
                return (
                  <button
                    key={cat.nombre}
                    className="btn-terrax mb-3 w-100"
                    onClick={() => setCategoriaSeleccionada(cat.nombre)}
                    style={{
                      backgroundColor: active ? verde : blanco,
                      color: active ? blanco : verdeOscuro,
                      border: active
                        ? `1px solid ${verde}`
                        : "1px solid #d9e4dd",
                    }}
                  >
                    {cat.nombre}
                  </button>
                );
              })}
            </Card>
          </Col>

          {/* Panel derecho */}
          <Col className="d-flex flex-column">
            <Row className="align-items-center mb-3">
              <Col>
                <h5
                  className="m-0 pb-2"
                  style={{
                    color: verdeOscuro,
                    borderBottom: `2px solid ${verde}22`,
                  }}
                >
                  Listado de {categoriaSeleccionada}
                </h5>
              </Col>
              <Col className="text-end">
                <button
                  className="btn-terrax-outline"
                  onClick={() => navigate("/productos")}
                >
                  <FaArrowLeft className="me-2" /> Volver
                </button>
              </Col>
            </Row>

            <div className="flex-fill d-flex flex-column">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: verde }} />
                  <div className="text-muted mt-2">Cargando productos…</div>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : productosFiltrados.length === 0 ? (
                <Card
                  className="p-4 rounded-4 shadow-sm text-center"
                  style={{
                    background: grisClaro,
                    border: `1px solid ${verde}20`,
                  }}
                >
                  <h6 className="fw-bold" style={{ color: verdeOscuro }}>
                    No hay productos en esta categoría
                  </h6>
                  <p className="text-muted mb-3">
                    Podés cargar nuevos productos ahora mismo.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn-terrax-outline"
                      onClick={() => navigate("/productos")}
                    >
                      Ir a Inicio
                    </button>
                    <button
                      className="btn-terrax"
                      onClick={() => navigate("/productos/agregar")}
                    >
                      Agregar producto
                    </button>
                  </div>
                </Card>
              ) : (
                <>
                  <Row className="g-3">
                    {productosFiltrados.map((prod) => (
                      <Col md={6} lg={4} key={prod.id}>
                        <Card
                          className="shadow-sm h-100"
                          style={{
                            background: blanco,
                            border: `1px solid ${verde}20`,
                            borderRadius: "1rem",
                          }}
                        >
                          <Card.Body className="p-3 d-flex flex-column">
                            <div className="mb-1">
                              <h6
                                className="fw-bold mb-0"
                                style={{ color: verdeOscuro }}
                              >
                                {prod.nombre || prod.cultivo || (
                                  <em>Sin nombre</em>
                                )}
                              </h6>
                              <small className="text-muted">
                                {prod.categoria}
                              </small>
                            </div>

                            <div className="mt-2" style={{ color: grisOscuro }}>
                              {prod.categoria === "SEMILLAS" ? (
                                <>
                                  <div>
                                    <strong>Cultivo:</strong>{" "}
                                    {prod.cultivo || "—"}
                                  </div>
                                  <div>
                                    <strong>Variedad:</strong>{" "}
                                    {prod.variedad || "—"}
                                  </div>
                                  <div>
                                    <strong>Días madurez:</strong>{" "}
                                    {prod.dias_madurez || "—"}
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <strong>Tipo:</strong> {prod.tipo || "—"}
                                </div>
                              )}
                            </div>

                            <div className="mt-auto pt-3 text-end">
                              <button
                                className="btn-terrax-outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEliminar(prod.id);
                                }}
                              >
                                <FaTrash className="me-1" /> Eliminar
                              </button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Botones más abajo */}
                  <Row className="mt-5">
                    <Col className="d-flex justify-content-end gap-3">
                      <button
                        className="btn-terrax-outline d-flex align-items-center"
                        onClick={() => navigate("/productos/inicio")}
                      >
                        <i className="bi bi-house-door me-2"></i> Inicio
                        Productos
                      </button>
                      <button
                        className="btn-terrax d-flex align-items-center"
                        onClick={() => navigate("/productos/agregar")}
                      >
                        <i className="bi bi-plus-circle me-2"></i> Agregar
                        producto
                      </button>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </div>
  );
};

export default ProductosLista;
