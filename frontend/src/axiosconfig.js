import axios from "axios";

// 🔸 Instancia raíz (lo que ya usa el resto de tu app)
const http = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

// 🔸 Instancia /api (para endpoints como /api/cac/pizarra/)
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // ojo el slash final
});

// ---- Interceptor de auth (mismo para ambas instancias) ----
async function authInterceptor(config) {
  let token = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now && refreshToken) {
      try {
        // uso axios "crudo" para evitar loop de interceptores
        const res = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
          refresh: refreshToken,
        });
        token = res.data.access;
        localStorage.setItem("accessToken", token);
      } catch (error) {
        console.error("Error al refrescar token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        throw error;
      }
    }

    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

http.interceptors.request.use(authInterceptor, (e) => Promise.reject(e));
api.interceptors.request.use(authInterceptor, (e) => Promise.reject(e));

// 🔸 Default = raíz, así no “desaparece” nada viejo
export default http;
