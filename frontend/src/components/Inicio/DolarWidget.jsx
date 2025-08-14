import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

const DolarWidget = () => {
  const [dolarData, setDolarData] = useState(null);
  const [blueData, setBlueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.bluelytics.com.ar/v2/latest")
      .then((res) => res.json())
      .then((data) => {
        setDolarData(data.oficial);
        setBlueData(data.blue);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener datos del dólar:", err);
        setLoading(false);
      });
  }, []);

  const renderDolarRow = (title, data) => {
    const diff = data.value_sell - data.value_buy;
    const isUp = diff > 0;
    const color = isUp ? "#198754" : "#dc3545";
    const Icon = isUp ? TrendingUp : TrendingDown;

    return (
      <div className="mb-3">
        <h6 className="text-dark fw-bold d-flex justify-content-center align-items-center gap-2">
          <DollarSign size={18} /> {title}
        </h6>
        <div className="text-muted small">
          <span className="me-3">
            <strong>Compra:</strong> ${data.value_buy}
          </span>
          <span>
            <strong>Venta:</strong> ${data.value_sell}
          </span>
        </div>
        <div className="mt-1 d-flex justify-content-center align-items-center gap-1" style={{ color }}>
          <Icon size={16} />
          <span className="small">
            Diferencia: ${diff.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Body className="text-center">
        <h5 className="text-success fw-bold mb-4">💵 Cotización del Dólar</h5>
        {loading ? (
          <div className="text-muted">
            <Spinner animation="border" size="sm" /> Cargando...
          </div>
        ) : (
          <>
            {dolarData && renderDolarRow("Dólar BNA (Oficial)", dolarData)}
            {blueData && renderDolarRow("Dólar Blue", blueData)}
            <small className="text-muted">Fuente: bluelytics.com.ar</small>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default DolarWidget;
