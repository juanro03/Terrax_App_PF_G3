import TerraxCard from "../ui/TerraxCard";
import usePizarraCAC from "../../hooks/usePizarraCAC";
import "./PreciosGranos.css";

const ACCENT = {
  "TRIGO":   { class: "trigo",   icon: "🌾" },
  "MAÍZ":    { class: "maiz",    icon: "🌽" },
  "GIRASOL": { class: "girasol", icon: "🌻" },
  "SOJA":    { class: "soja",    icon: "🫘" },
  "SORGO":   { class: "sorgo",   icon: "🌱" },
};

export default function PreciosGranos() {
  const { fecha, items, loading, error } = usePizarraCAC();

  return (
    <TerraxCard>
      <h4 className="titulo">Precios de granos del día {fecha} - Bolsa de Comercio Rosario - ($/Tn)</h4>
      {loading && <div>Cargando…</div>}
      {error && <div className="text-danger">No se pudieron cargar los precios.</div>}

      {!loading && !error && (
        <div className="granos-grid" role="list">
          {items.map((it) => {
            const meta = ACCENT[it.producto] || { class: "", icon: "🌾" };
            const isSC = !it.precio;
            return (
              <article
                role="listitem"
                key={it.producto}
                className={`grano-tile ${meta.class}`}
                aria-label={`${it.producto} ${isSC ? "sin cotización" : it.precio_texto}`}
              >
                <header className="tile-head">
                  <span className="tile-icon" aria-hidden>{meta.icon}</span>
                  <h3 className="tile-title">{it.producto}</h3>
                </header>

                <div className="tile-body">
                  <div className={`tile-price ${isSC ? "sc" : ""}`}>
                    {isSC ? "S/C" : it.precio_texto}
                  </div>

                  <div className="tile-sub">
                    <span className="sub-label">Estimativo</span>
                    <span className="sub-value">
                      {it.estimativo ? `$${it.estimativo.toLocaleString("es-AR")}` : "–"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </TerraxCard>
  );
}
