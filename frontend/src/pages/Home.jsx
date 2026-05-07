import { useEffect, useState } from "react";

import SearchBar from "../components/SearchBar.jsx";
import { getPrices, getProducts } from "../services/api.js";

export default function Home() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(currentSearch = "", currentCity = "") {
    setLoading(true);
    setError("");
    try {
      const [productData, priceData] = await Promise.all([
        getProducts(currentSearch),
        getPrices({ search: currentSearch, city: currentCity }),
      ]);
      setProducts(productData);
      setPrices(priceData);
    } catch (err) {
      setError("Impossible de charger les donnees pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    loadData(search, city);
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">SoumiTaw</p>
        <h1>Comparez les prix alimentaires en Tunisie, simplement.</h1>
        <p className="hero-copy">
          Une base de depart pour reperer les meilleurs prix par produit et par ville.
        </p>
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSubmit}
          city={city}
          onCityChange={setCity}
        />
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="panel">
        <div className="panel-heading">
          <h2>Produits</h2>
          <span>{products.length} resultat(s)</span>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="chips">
            {products.map((product) => (
              <a key={product.id} className="chip chip-link" href={`#/product/${product.id}`}>
                {product.name}
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Derniers prix approuves</h2>
          <span>{prices.length} entree(s)</span>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="price-grid">
            {prices.map((entry) => (
              <article key={entry.id} className="price-card">
                <div className="price-card-top">
                  <h3>{entry.product.name}</h3>
                  <strong>{Number(entry.price).toFixed(3)} TND</strong>
                </div>
                <p>{entry.merchant?.name || "Source citoyenne"}</p>
                <p>
                  {entry.city || "Ville inconnue"}{entry.region ? `, ${entry.region}` : ""}
                </p>
                <div className="card-actions">
                  <a className="ghost-button" href={`#/product/${entry.product.id}`}>
                    Voir le detail
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
