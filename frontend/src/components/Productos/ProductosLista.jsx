import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ProductosLista = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  if (loading)
    return (
      <div className="text-center">
        <Spinner animation="border" />
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (productos.length === 0)
    return <Alert variant="secondary">No hay productos cargados aún.</Alert>;

  return (
    <div className="container my-5 ms-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0 ms-3">Mis Productos</h2>
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/productos")}
          className="me-3"
          size="sm"
        >
          Volver
        </Button>
      </div>

      <Row>
        {productos.map((prod, idx) => (
          <Col key={prod.id} md={6} lg={4} className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="shadow-sm rounded-4 h-100 d-flex flex-column justify-content-between">
                <Card.Body>
                  <Card.Title>
                    {prod.nombre ? (
                      <span>{prod.nombre}</span>
                    ) : prod.categoria === "SEMILLAS" ? (
                      <span>{prod.cultivo}</span>
                    ) : (
                      <em>Sin nombre</em>
                    )}
                  </Card.Title>

                  <Card.Subtitle className="mb-2 text-muted">
                    {prod.categoria}
                  </Card.Subtitle>

                  <Card.Text>
                    {prod.categoria === "SEMILLAS" ? (
                      <>
                        <strong>Cultivo:</strong> {prod.cultivo} <br />
                        <strong>Variedad:</strong> {prod.variedad} <br />
                        <strong>Días de madurez:</strong> {prod.dias_madurez}
                      </>
                    ) : (
                      <>
                        <strong>Tipo:</strong> {prod.tipo}
                      </>
                    )}
                  </Card.Text>
                </Card.Body>

                <div className="text-end p-3 pt-0">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleEliminar(prod.id)}
                  >
                    🗑️ Eliminar
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductosLista;
