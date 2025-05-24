import { Navigate } from "react-router-dom";
import { useUser } from "../../UserContext";

const AdminRoute = ({ children }) => {
  const { usuario } = useUser();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== "admin") {
    return <Navigate to="/inicio" replace />;
  }

  return children;
};

export default AdminRoute;
