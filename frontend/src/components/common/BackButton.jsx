import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BackButton({ to, label = "Volver", size = "sm" }) {
  const navigate = useNavigate();
  const onClick = () => (to ? navigate(to) : navigate(-1));

  return (
    <button
      type="button"
      className={`btn btn-outline-success d-inline-flex align-items-center btn-${size}`}
      style={{ height: "32px", whiteSpace: "nowrap" }}
      onClick={onClick}
    >
      <FaArrowLeft className="me-2" /> {label}
    </button>
  );
}
