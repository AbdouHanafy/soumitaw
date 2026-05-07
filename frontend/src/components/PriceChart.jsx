function buildPath(points, width, height, minValue, maxValue) {
  if (points.length === 0) return "";
  const xStep = points.length === 1 ? 0 : width / (points.length - 1);
  const range = maxValue - minValue || 1;

  return points
    .map((point, index) => {
      const x = index * xStep;
      const normalized = (point.average_price - minValue) / range;
      const y = height - normalized * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function PriceChart({ points }) {
  if (!points.length) {
    return <p className="muted">Pas assez d'historique pour afficher une tendance.</p>;
  }

  const width = 560;
  const height = 220;
  const values = points.map((point) => Number(point.average_price));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const path = buildPath(points, width, height, minValue, maxValue);

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Evolution des prix">
        <path d={path} fill="none" stroke="#c76b00" strokeWidth="4" strokeLinecap="round" />
        {points.map((point, index) => {
          const xStep = points.length === 1 ? 0 : width / (points.length - 1);
          const range = maxValue - minValue || 1;
          const x = index * xStep;
          const normalized = (Number(point.average_price) - minValue) / range;
          const y = height - normalized * height;
          return <circle key={point.label} cx={x} cy={y} r="5" fill="#0f766e" />;
        })}
      </svg>
      <div className="chart-labels">
        {points.map((point) => (
          <div key={point.label}>
            <strong>{point.label}</strong>
            <span>{Number(point.average_price).toFixed(3)} TND</span>
          </div>
        ))}
      </div>
    </div>
  );
}
