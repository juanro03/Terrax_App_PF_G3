import TerraxCard from "../ui/TerraxCard";
import usePizarraCAC from "../../hooks/usePizarraCAC";
import "./PreciosGranos.css";

export default function PreciosGranos(){
  const { fecha, items, loading, error } = usePizarraCAC();
  return (
    <TerraxCard icon="🌾" title="Precios de granos (BCR - CAC)" subtitle={fecha}>
      {loading && <div>Cargando…</div>}
      {error && <div className="text-danger">No se pudieron cargar los precios.</div>}
      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-sm align-middle terrax-table">
            <thead><tr><th>Producto</th><th className="text-end">Precio</th><th className="text-end">Estimativo</th></tr></thead>
            <tbody>
              {items.map(it=>(
                <tr key={it.producto}>
                  <td className="fw-medium">{it.producto}</td>
                  <td className={`text-end ${it.precio ? "" : "text-muted"}`}>{it.precio_texto}</td>
                  <td className="text-end">{it.estimativo ? `$${it.estimativo.toLocaleString("es-AR")}` : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TerraxCard>
  );
}
