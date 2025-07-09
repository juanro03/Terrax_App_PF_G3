import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const categorias = [
  { nombre: "COADYUVANTES", color: "#e9f7ef" },
  { nombre: "FERTILIZANTES", color: "#e9f7ef" },
  { nombre: "AGROQUIMICOS", color: "#e9f7ef" },
  { nombre: "SEMILLAS", color: "#e9f7ef" },
];

const ProductosLista = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState("COADYUVANTES");
  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    const token = localStorage.getItem("accessToken");
    axios
      .get("http://localhost:8000/api/productos/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProductos(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los productos");
        setLoading(false);
      });
  };

  const handleEliminar = async (id) => {
    const confirmacion = window.confirm(
      "¿Estás seguro que deseas eliminar este producto?"
    );
    if (!confirmacion) return;

    const token = localStorage.getItem("accessToken");

    try {
      await axios.delete(`http://localhost:8000/api/productos/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProductos(productos.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar el producto", error);
      alert("No se pudo eliminar el producto.");
    }
  };

  const productosFiltrados = productos.filter(
    (prod) => prod.categoria === categoriaSeleccionada
  );

  return (
    <Container fluid className="d-flex mt-4" style={{ minHeight: "80vh" }}>
      <Card
        className="p-3 me-4 shadow-sm"
        style={{ width: "250px", borderRadius: "20px" }}
      >
        <h5 className="text-center fw-bold">Categorías</h5>
        {categorias.map((cat) => (
          <Button
            key={cat.nombre}
            variant="light"
            className="mb-3 w-100"
            onClick={() => setCategoriaSeleccionada(cat.nombre)}
            style={{
              backgroundColor: cat.color,
              border: "none",
              borderRadius: "12px",
              color: "#000",
              height: "60px",
              fontSize: "18px",
              fontWeight: "400",
              boxShadow:
                categoriaSeleccionada === cat.nombre
                  ? "0 0 0 2px #198754"
                  : "none",
              transform:
                categoriaSeleccionada === cat.nombre
                  ? "scale(1.03)"
                  : "scale(1)",
            }}
          >
            {cat.nombre}
          </Button>
        ))}
      </Card>

      <div
        className="flex-grow-1 p-4 rounded-4 shadow-sm"
        style={{ backgroundColor: "#e0ece5" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Mis Productos: {categoriaSeleccionada}</h5>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/productos")}
            style={{
              borderRadius: "10px",
              padding: "6px 14px",
              fontWeight: "500",
            }}
          >
            Volver
          </Button>
        </div>

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : productosFiltrados.length === 0 ? (
          <Alert variant="secondary">
            No hay productos cargados aún para esta categoría.
          </Alert>
        ) : (
          <Row>
            {productosFiltrados.map((prod) => (
              <Col md={6} lg={4} key={prod.id} className="mb-4">
                <Card
                  className="shadow-sm rounded-4 p-3"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <h6 className="fw-bold mb-2">
                    {prod.nombre || prod.cultivo || <em>Sin nombre</em>}
                  </h6>
                  <p className="mb-1 text-muted">{prod.categoria}</p>
                  <p className="mb-2">
                    {prod.categoria === "SEMILLAS"
                      ? `${prod.cultivo} - ${prod.variedad} - ${prod.dias_madurez}`
                      : prod.tipo}
                  </p>
                  <div className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminar(prod.id)}
                      style={{ borderRadius: "8px" }}
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Container>
  );
};

export default ProductosLista;
