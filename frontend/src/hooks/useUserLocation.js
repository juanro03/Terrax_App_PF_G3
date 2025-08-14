import { useEffect, useState, useCallback } from "react";

/**
 * Maneja permiso + coordenadas del usuario.
 * - Guarda en localStorage: geoConsent ("granted" | "denied") y geoCoords ({lat, lon})
 * - Reintenta sólo si el usuario lo pide (gesto explícito)
 */
export default function useUserLocation() {
  const [status, setStatus] = useState(
    localStorage.getItem("geoConsent") || "unknown"
  ); // "granted" | "denied" | "prompt" | "unknown"
  const [coords, setCoords] = useState(() => {
    const raw = localStorage.getItem("geoCoords");
    return raw ? JSON.parse(raw) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dispara el prompt del navegador (¡mejor desde un click!)
  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no soporta geolocalización.");
      setStatus("denied");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const c = { lat: latitude, lon: longitude };
        setCoords(c);
        localStorage.setItem("geoCoords", JSON.stringify(c));
        localStorage.setItem("geoConsent", "granted");
        setStatus("granted");
        setLoading(false);
      },
      (err) => {
        // 1: Denied, 2: Unavailable, 3: Timeout
        setError(err.message || "No se pudo obtener tu ubicación.");
        const s = err.code === 1 ? "denied" : "prompt";
        localStorage.setItem("geoConsent", s);
        setStatus(s);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  // Intento no intrusivo: leer estado del permiso si el browser lo expone
  useEffect(() => {
    let mounted = true;
    if (status === "unknown" && "permissions" in navigator) {
      // @ts-ignore
      navigator.permissions
        .query({ name: "geolocation" })
        .then((p) => mounted && setStatus(p.state)); // "granted" | "denied" | "prompt"
        // si es granted podríamos auto-solicitar coords:
        // p.state === "granted" && request();
    }
    return () => { mounted = false; };
  }, [status]);

  // utilidades
  const reset = () => {
    localStorage.removeItem("geoConsent");
    localStorage.removeItem("geoCoords");
    setStatus("prompt");
    setCoords(null);
  };

  return { status, coords, loading, error, request, reset };
}
