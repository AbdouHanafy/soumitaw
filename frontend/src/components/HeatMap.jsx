function intensityStyle(intensity) {
  const hue = 120 - intensity * 90;
  const alpha = 0.18 + intensity * 0.5;
  return {
    background: `linear-gradient(180deg, hsla(${hue}, 80%, 45%, ${alpha}), rgba(255,255,255,0.92))`,
    borderColor: `hsla(${hue}, 70%, 35%, ${Math.min(alpha + 0.15, 0.9)})`,
  };
}

export default function HeatMap({ regions, selectedRegion, onSelectRegion }) {
  if (!regions.length) {
    return <p className="muted">Aucune region disponible pour la heatmap.</p>;
  }

  return (
    <div className="heat-grid">
      {regions.map((region) => {
        const isActive = selectedRegion === region.region;
        return (
          <button
            key={region.region}
            type="button"
            className={`heat-card ${isActive ? "active" : ""}`}
            style={intensityStyle(region.intensity)}
            onClick={() => onSelectRegion(isActive ? "" : region.region)}
          >
            <strong>{region.region}</strong>
            <span>{Number(region.average_price).toFixed(3)} TND</span>
            <small>{region.sample_size} prix</small>
          </button>
        );
      })}
    </div>
  );
}
