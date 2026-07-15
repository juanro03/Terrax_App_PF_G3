import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { DollarSign, TrendingUp, TrendingDown, Info } from "lucide-react";
import "./CotizacionDolar.css";

const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Row = ({ title, data, currency = "USD" }) => {
  if (!data) return null;
  const diff = (data.value_sell ?? 0) - (data.value_buy ?? 0);
  const isUp = diff >= 0;
  const Icon = diff === 0 ? Info : isUp ? TrendingUp : TrendingDown;
  const color = diff === 0 ? "#6c757d" : isUp ? "#198754" : "#dc3545";

  return (
    <div className="dolar-row">
      <div className="dolar-title">
        <DollarSign size={18} />
        <span>{title}</span>
        <small className="cur-badge">{currency}</small>
      </div>

      <div className="dolar-values fila">
        <span>Compra: <strong>${nf.format(data.value_buy)}</strong></span>
        <span>Venta: <strong>${nf.format(data.value_sell)}</strong></span>
      </div>

      <div className="dolar-meta">
        <span>Promedio: <strong>${nf.format(data.value_avg)}</strong></span>
        <span className="dolar-diff" style={{ color }}>
          <Icon size={16} />
          <span>Brecha: ${nf.format(diff)}</span>
        </span>
      </div>
    </div>
  );
};

export default function DolarWidget() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://api.bluelytics.com.ar/v2/latest");
        const data = await res.json();
        setLatest(data);
      } catch (e) {
        console.error("Error al obtener datos del dólar:", e);
        setError("No se pudo cargar la cotización.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lastUpdate = latest?.last_update
    ? new Date(latest.last_update).toLocaleString("es-AR")
    : null;

  return (
    <div className="dolar-card h-100">
      <h4 className="dolar-header">Cotizaciones</h4>

      {loading ? (
        <div className="dolar-loading">
          <Spinner animation="border" size="sm" /> Cargando...
        </div>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : (
        <>
          <div className="dolar-rows">
            <Row title="Dólar BNA (Oficial)" data={latest?.oficial} currency="USD" />
            <Row title="Dólar Blue" data={latest?.blue} currency="USD" />
            <Row title="Euro Oficial" data={latest?.oficial_euro} currency="EUR" />
            <Row title="Euro Blue" data={latest?.blue_euro} currency="EUR" />
          </div>

          <div className="dolar-footer">
            <div className="source">Fuente: bluelytics.com.ar</div>
            {lastUpdate && <div className="updated">Actualizado: {lastUpdate}</div>}
          </div>
        </>
      )}
    </div>
  );
}
