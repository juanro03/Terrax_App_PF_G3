import { useParams } from "react-router-dom";
import VerLotes from "./VerLotes";

const VerLotesWrapper = () => {
  const { campoId } = useParams(); // ← Esto lo lee de la URL
  return <VerLotes campoId={parseInt(campoId)} />; // ← Se lo pasa al componente real
};

export default VerLotesWrapper;
