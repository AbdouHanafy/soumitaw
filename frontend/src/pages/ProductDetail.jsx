import { useEffect, useState } from "react";

import PriceChart from "../components/PriceChart.jsx";
import { getProductDetail } from "../services/api.js";

export default function ProductDetail({ productId }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError("");
      try {
        const data = await getProductDetail(productId);
        setDetail(data);
      } catch (err) {
        setError("Impossible de charger ce produit.");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadDetail();
    }
  }, [productId]);

  if (loading) {
    return <main className="page-shell"><section className="panel"><p>Chargement...</p></section></main>;
  }

  if (error || !detail) {
    return <main className="page-shell"><section className="panel"><p className="error">{error || "Produit introuvable."}</p></section></main>;
  }

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Detail produit</p>
        <h1>{detail.product.name}</h1>
        <p className="hero-copy">
          {detail.product.category || "Categorie a confirmer"}{detail.product.unit ? ` - ${detail.product.unit}` : ""}
        </p>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Prix min</span>
          <strong>{detail.stats.min_price ? `${Number(detail.stats.min_price).toFixed(3)} TND` : "-"}</strong>
        </article>
        <article className="stat-card">
          <span>Prix moyen</span>
          <strong>{detail.stats.avg_price ? `${Number(detail.stats.avg_price).toFixed(3)} TND` : "-"}</strong>
        </article>
        <article className="stat-card">
          <span>Prix max</span>
          <strong>{detail.stats.max_price ? `${Number(detail.stats.max_price).toFixed(3)} TND` : "-"}</strong>
        </article>
        <article className="stat-card">
          <span>Entrees</span>
          <strong>{detail.stats.entries}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Tendance des prix</h2>
          <span>Graphique basique</span>
        </div>
        <PriceChart points={detail.timeline} />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Par region</h2>
        </div>
        <div className="price-grid">
          {detail.region_stats.map((region) => (
            <article key={region.region} className="price-card">
              <h3>{region.region}</h3>
              <p>Min: {Number(region.min_price).toFixed(3)} TND</p>
              <p>Moyen: {Number(region.avg_price).toFixed(3)} TND</p>
              <p>Max: {Number(region.max_price).toFixed(3)} TND</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Commercants et soumissions</h2>
          <span>{detail.merchants.length} entree(s)</span>
        </div>
        <div className="price-grid">
          {detail.merchants.map((entry) => (
            <article key={entry.id} className="price-card">
              <div className="price-card-top">
                <h3>{entry.merchant?.name || "Contribution citoyenne"}</h3>
                <strong>{Number(entry.price).toFixed(3)} TND</strong>
              </div>
              <p>{entry.region || "Region inconnue"}</p>
              <p>Confiance IA: {entry.confidence ? Number(entry.confidence).toFixed(2) : "-"}</p>
              <div className="card-actions">
                <button type="button" className="ghost-button">Signaler un prix</button>
                <button type="button" className="ghost-button">Creer une alerte</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
