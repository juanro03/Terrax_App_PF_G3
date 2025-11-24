import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft } from "react-icons/fa";

// === PALETA / TOKENS (consistente)
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
  const [productoAEliminar, setProductoAEliminar] = useState(null);


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

  // pedir confirmación para eliminar (sin window.confirm)
  const handleEliminar = (producto) => {
    setProductoAEliminar(producto);
  };

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return;

    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(
        `http://localhost:8000/api/productos/${productoAEliminar.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProductos((prev) =>
        prev.filter((p) => p.id !== productoAEliminar.id)
      );
    } catch (err) {
      console.error("Error al eliminar el producto", err);
      alert("No se pudo eliminar el producto.");
    } finally {
      setProductoAEliminar(null);
    }
  };

  const cancelarEliminar = () => {
    setProductoAEliminar(null);
  };


  const productosFiltrados = productos.filter(
    (prod) => prod.categoria === categoriaSeleccionada
  );

  return (
    <Card
      className="mx-auto my-5 shadow"
      style={{
        maxWidth: "1160px",
        background: blanco,
        borderRadius: "1.4rem",
        border: "none",
        transform: "none",
        transition: "none",
      }}
    >
      <Card.Body>
        {/* Título */}
        <Card.Title className="fw-bold mb-4" style={{
          color: verdeOscuro,
        }}>
          Mis Productos — {categoriaSeleccionada}
        </Card.Title>

        {/* Layout principal con alturas iguales */}
        <Row className="g-4 align-items-stretch">
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
                  <Button
                    key={cat.nombre}
                    variant="light"
                    className="mb-3 w-100 rounded-pill"
                    onClick={() => setCategoriaSeleccionada(cat.nombre)}
                    style={{
                      backgroundColor: active ? verde : blanco,
                      color: active ? blanco : verdeOscuro,
                      border: active
                        ? `1px solid ${verde}`
                        : "1px solid #d9e4dd",
                      boxShadow: active ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                      fontWeight: active ? 700 : 500,
                      height: 48,
                      transition: "all .2s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.backgroundColor = verdeClaro;
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        e.currentTarget.style.backgroundColor = blanco;
                    }}
                  >
                    {cat.nombre}
                  </Button>
                );
              })}
            </Card>
          </Col>

          {/* Panel derecho */}
          <Col className="d-flex flex-column">
            {/* Header de acción */}
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
                <Button
                  variant="outline-success"
                  size="sm"
                  className="d-inline-flex align-items-center"
                  style={{ fontWeight: "bold", borderColor: verde }}
                  onClick={() => navigate("/productos")}
                >
                  <FaArrowLeft className="me-2" /> Volver
                </Button>
              </Col>
            </Row>

            {/* Contenido */}
            <div className="flex-fill">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
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
                    <Button
                      variant="outline-success"
                      style={{ fontWeight: "bold", borderColor: verde }}
                      onClick={() => navigate("/productos")}
                    >
                      Ir a Inicio
                    </Button>
                    <Button
                      variant="success"
                      style={{
                        fontWeight: "bold",
                        backgroundColor: verde,
                        border: "none",
                      }}
                      onClick={() => navigate("/productos/agregar")}
                    >
                      Agregar producto
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  {/* grilla de productos */}
                  <Row className="g-3">
                    {productosFiltrados.map((prod) => (
                      <Col md={6} lg={4} key={prod.id}>
                        <Card
                          className="shadow-sm rounded-4 h-100"
                          style={{
                            background: blanco,
                            border: `1px solid ${verde}20`,
                            transition:
                              "transform .15s ease, box-shadow .15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 12px 22px rgba(0,0,0,.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "";
                          }}
                        >
                          <Card.Body className="p-3 d-flex flex-column">
                            <div className="mb-1">
                              <h6
                                className="fw-bold mb-0"
                                style={{ color: verdeOscuro }}
                                title={
                                  prod.nombre || prod.cultivo || "Sin nombre"
                                }
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
                                <div>
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
                                </div>
                              ) : (
                                <div>
                                  <strong>Tipo:</strong> {prod.tipo || "—"}
                                </div>
                              )}
                            </div>

                            <div className="mt-auto pt-3 text-end">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEliminar(prod);
                                }}
                              >
                                <FaTrash className="me-1" /> Eliminar
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Botones de navegación SOLO si hay productos */}
                  <Row className="mt-4">
                    <Col className="d-flex justify-content-end gap-3">
                      <Button
                        variant="outline-success"
                        className="px-4 shadow-sm d-flex align-items-center"
                        style={{ fontWeight: "bold", borderColor: verde }}
                        onClick={() => navigate("/productos/inicio")}
                      >
                        <i className="bi bi-house-door me-2"></i> 
                        Inicio Productos
                      </Button>

                      <Button
                        variant="success"
                        className="px-4 shadow-sm d-flex align-items-center"
                        style={{
                          fontWeight: "bold",
                          backgroundColor: verde,
                          border: "none",
                        }}
                        onClick={() => navigate("/productos/agregar")}
                      >
                        <i className="bi bi-plus-circle me-2"></i> 
                        Agregar producto
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </div>
          </Col>
        </Row>

        {productoAEliminar && (
          <div className="confirm-overlay">
            <div className="confirm-card p-4">
              <h5 className="fw-bold mb-2">
                ¿Seguro que desea eliminar el producto "
                {productoAEliminar.nombre ||
                  productoAEliminar.cultivo ||
                  "sin nombre"}
                "?
              </h5>
              <p className="mb-2">
                Esta acción es irreversible y eliminará el producto de tu listado.
              </p>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={cancelarEliminar}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmarEliminar}
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </Card.Body>
    </Card>
  );
};

export default ProductosLista;