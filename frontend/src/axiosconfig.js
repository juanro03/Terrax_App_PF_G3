import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

instance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        // accessToken expirado, intentamos refrescar
        try {
          const res = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
            refresh: refreshToken,
          });
          token = res.data.access;
          localStorage.setItem("accessToken", token);
        } catch (error) {
          console.error("Error al refrescar token:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
