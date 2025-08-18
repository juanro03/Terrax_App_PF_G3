import React from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import useUserLocation from "../../hooks/useUserLocation";

export default function GeoConsentBanner() {
  const { status, coords, loading, request, reset } = useUserLocation();

  const askOnLogin = sessionStorage.getItem("geoAskOnLogin") === "1";
  const shouldShow =
    askOnLogin || status === "prompt" || status === "unknown" || !coords;

  if (!shouldShow) return null;

  const handleAccept = () => {
    request(); // dispara geolocalización (puede no mostrar pop-up si el permiso ya está 'granted')
    sessionStorage.removeItem("geoAskOnLogin");
  };

  const handleDecline = () => {
    reset(); // deja status en "prompt" y borra coords
    sessionStorage.removeItem("geoAskOnLogin");
  };

  return (
    <Alert variant="success" className="d-flex align-items-center justify-content-between">
      <div>
        <strong>¿Querés ver el clima de tu zona?</strong> Permitinos usar tu ubicación para el pronóstico local.
      </div>
      <div className="d-flex gap-2">
        <Button variant="success" onClick={handleAccept} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Usar mi ubicación"}
        </Button>
        <Button variant="outline-success" onClick={handleDecline}>
          No, gracias
        </Button>
      </div>
    </Alert>
  );
}
