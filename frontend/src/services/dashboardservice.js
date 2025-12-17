import axios from "axios";

const API_URL = "http://localhost:8000";

// 🔒 cache en memoria
let cachedStats = null;
let pendingRequest = null;

export const getDashboardStats = async () => {
  // si ya hay datos → devolverlos
  if (cachedStats) {
    return Promise.resolve({ data: cachedStats });
  }

  // si ya hay una request en curso → reutilizarla
  if (pendingRequest) {
    return pendingRequest;
  }

  // crear request
  pendingRequest = axios.get(`${API_URL}/dashboard/stats/`);

  const res = await pendingRequest;
  cachedStats = res.data;
  pendingRequest = null;

  return res;
};

// opcional si después querés refrescar
export const clearDashboardCache = () => {
  cachedStats = null;
};
