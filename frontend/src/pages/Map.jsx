import { useEffect, useMemo, useState } from "react";

import HeatMap from "../components/HeatMap.jsx";
import MapView from "../components/MapView.jsx";
import { getMapStats } from "../services/api.js";

export default function Map() {
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError("");
      try {
        const data = await getMapStats({ category, region });
        setStats(data);
      } catch (err) {
        setError("Impossible de charger la carte des prix.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [category, region]);

  const localPrices = useMemo(() => {
    if (!stats?.points) return [];
    return stats.points.filter((point) => !region || point.region === region);
  }, [stats, region]);

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Vision geographique</p>
        <h1>Carte des prix</h1>
        <p className="hero-copy">
          Explorez les prix approuves par region, comparez les zones et zoomez sur les points locaux.
        </p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Filtres</h2>
          <button type="button" className="ghost-button" onClick={() => { setCategory(""); setRegion(""); }}>
            Reinitialiser
          </button>
        </div>
        <div className="filter-bar">
          <label>
            Categorie
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Toutes</option>
              {(stats?.filters.categories || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Region
            <select value={region} onChange={(event) => setRegion(event.target.value)}>
              <option value="">Toutes</option>
              {(stats?.filters.regions || []).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="map-layout">
        <div className="panel map-panel">
          <div className="panel-heading">
            <h2>Carte Leaflet</h2>
            <span>{stats?.points.length || 0} point(s)</span>
          </div>
          {loading ? <p>Chargement...</p> : <MapView points={stats?.points || []} selectedRegion={region} />}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Heatmap par gouvernorat</h2>
            <span>Cliquez pour filtrer</span>
          </div>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <HeatMap
              regions={stats?.heatmap || []}
              selectedRegion={region}
              onSelectRegion={setRegion}
            />
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Comparaison inter-regions</h2>
          <span>{stats?.comparisons.length || 0} region(s)</span>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="comparison-table">
            <div className="comparison-header">
              <span>Region</span>
              <span>Prix moyen</span>
              <span>Couverture</span>
              <span>Derniere entree</span>
            </div>
            {(stats?.comparisons || []).map((item) => (
              <button
                key={item.region}
                type="button"
                className={`comparison-row ${region === item.region ? "active" : ""}`}
                onClick={() => setRegion(region === item.region ? "" : item.region)}
              >
                <span>{item.region}</span>
                <span>{Number(item.average_price).toFixed(3)} TND</span>
                <span>{item.product_coverage} produit(s)</span>
                <span>{new Date(item.latest_entry_at).toLocaleDateString("fr-FR")}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Prix locaux</h2>
          <span>{localPrices.length} entree(s)</span>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="price-grid">
            {localPrices.map((point) => (
              <article key={point.id} className="price-card">
                <div className="price-card-top">
                  <h3>{point.product_name}</h3>
                  <strong>{Number(point.price).toFixed(3)} TND</strong>
                </div>
                <p>{point.merchant_name || "Contribution citoyenne"}</p>
                <p>{point.city || "Ville inconnue"}{point.region ? `, ${point.region}` : ""}</p>
                <p>{point.category || "Categorie non definie"}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
