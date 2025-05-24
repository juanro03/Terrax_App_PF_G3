import { createContext, useContext, useEffect, useState } from "react";
import axios from "./axiosconfig";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("token de acceso: ", token)
    if (!token) return;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const data = JSON.parse(jsonPayload);
      const userId = data.user_id;
      console.log("id de usuario: ", userId)

      if (userId) {
        axios.get(`api/usuarios/${userId}/`)
          .then(res => setUsuario(res.data))
          .catch(err => {
            console.error("Error al obtener el usuario:", err.response?.data || err);
            setUsuario(null);
          });
      }
    } catch (error) {
      console.error("Token inválido:", error);
      setUsuario(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
