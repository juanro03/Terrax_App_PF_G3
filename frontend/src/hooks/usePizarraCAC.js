import { useEffect, useState } from "react";
import axios from "../axiosconfig";
// usePizarraCAC.js
import { api } from "../axiosconfig";   // antes importaba default
// ...


export default function usePizarraCAC() {
  const [data, setData] = useState({ fecha: null, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const { data: res } = await api.get("/cac/pizarra/"); // baseURL ya incluye /api
        if (!cancel) setData(res);
      } catch (e) {
        console.error("CAC pizarra:", e.response?.status, e.response?.data || e.message);
        if (!cancel) setError("No se pudieron cargar los precios.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  return { ...data, loading, error };
}