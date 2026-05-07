import { useEffect, useState } from "react";

import { getProfile } from "../services/api.js";

const DEFAULT_USER_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile(DEFAULT_USER_ID);
        setProfile(data);
      } catch (err) {
        setError("Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return <main className="page-shell"><section className="panel"><p>Chargement...</p></section></main>;
  }

  if (error || !profile) {
    return <main className="page-shell"><section className="panel"><p className="error">{error || "Profil indisponible."}</p></section></main>;
  }

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Profil citoyen</p>
        <h1>{profile.user.email}</h1>
        <p className="hero-copy">
          Niveau {profile.level} - {profile.user.points} points - Reputation {Number(profile.user.reputation).toFixed(2)}
        </p>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Points</span>
          <strong>{profile.user.points}</strong>
        </article>
        <article className="stat-card">
          <span>Niveau</span>
          <strong>{profile.level}</strong>
        </article>
        <article className="stat-card">
          <span>Reputation</span>
          <strong>{Number(profile.user.reputation).toFixed(2)}</strong>
        </article>
        <article className="stat-card">
          <span>Prochain palier</span>
          <strong>{profile.next_level_points ? `${profile.next_level_points} pts` : "Maximum"}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>Historique des soumissions</h2>
          <span>{profile.submissions.length} entree(s)</span>
        </div>
        <div className="price-grid">
          {profile.submissions.map((entry) => (
            <article key={entry.id} className="price-card">
              <div className="price-card-top">
                <h3>{entry.product.name}</h3>
                <strong>{Number(entry.price).toFixed(3)} TND</strong>
              </div>
              <p>{entry.city || "Ville inconnue"}{entry.region ? `, ${entry.region}` : ""}</p>
              <p>Statut: {entry.status}</p>
              <p>Source: {entry.source === "citizen" ? "Soumission citoyenne" : entry.source}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
