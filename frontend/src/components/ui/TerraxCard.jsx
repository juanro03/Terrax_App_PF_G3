export default function TerraxCard({ icon, title, subtitle, children }) {
  return (
    <div className="terrax-card">
      <div className="terrax-card__header">
        {icon ? <span>{icon}</span> : null}
        <span>{title}</span>
        {subtitle ? <span className="ms-2 terrax-card__subtitle">• {subtitle}</span> : null}
      </div>
      <div className="terrax-card__body">{children}</div>
    </div>
  );
}