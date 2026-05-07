import { useMemo, useState } from "react";

import { analyzeSubmission, submitPrice } from "../services/api.js";

const DEFAULT_USER_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd";

export default function SubmitPrice() {
  const [form, setForm] = useState({
    product_name: "",
    price: "",
    city: "Tunis",
    region: "Tunis",
    raw_text: "",
    latitude: "36.8065",
    longitude: "10.1815",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [confirmLowConfidence, setConfirmLowConfidence] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const needsConfirmation = useMemo(
    () => result?.normalization?.needs_confirmation || false,
    [result]
  );

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleAnalyze() {
    const formData = new FormData();
    formData.append("raw_text", form.raw_text);
    if (photo) formData.append("photo", photo);
    try {
      const data = await analyzeSubmission(formData);
      setPreview(data);
      if (data.detected_product_name && !form.product_name) {
        updateField("product_name", data.detected_product_name);
      }
      if (data.detected_price && !form.price) {
        updateField("price", String(data.detected_price));
      }
    } catch (err) {
      setError("Analyse OCR indisponible pour le moment.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append("user_id", DEFAULT_USER_ID);
    formData.append("source", "citizen");
    formData.append("confirm_low_confidence", String(confirmLowConfidence));
    if (photo) formData.append("photo", photo);

    try {
      const data = await submitPrice(formData);
      setResult(data);
      setConfirmLowConfidence(false);
    } catch (err) {
      const message = err?.payload?.detail?.message || err.message || "Soumission impossible.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero compact">
        <p className="eyebrow">Contribution citoyenne</p>
        <h1>Soumettre un prix</h1>
        <p className="hero-copy">
          Formulaire manuel avec support OCR de base, normalisation produit et geolocalisation pre-remplie.
        </p>
      </section>

      <section className="submit-layout">
        <form className="panel submit-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <h2>Nouveau prix</h2>
            <button type="button" className="ghost-button" onClick={handleAnalyze}>
              Analyser la photo
            </button>
          </div>

          <label>
            Produit
            <input value={form.product_name} onChange={(event) => updateField("product_name", event.target.value)} required />
          </label>

          <label>
            Prix
            <input type="number" step="0.001" value={form.price} onChange={(event) => updateField("price", event.target.value)} required />
          </label>

          <label>
            Ville
            <input value={form.city} onChange={(event) => updateField("city", event.target.value)} required />
          </label>

          <label>
            Region
            <input value={form.region} onChange={(event) => updateField("region", event.target.value)} required />
          </label>

          <div className="inline-fields">
            <label>
              Latitude
              <input value={form.latitude} onChange={(event) => updateField("latitude", event.target.value)} />
            </label>
            <label>
              Longitude
              <input value={form.longitude} onChange={(event) => updateField("longitude", event.target.value)} />
            </label>
          </div>

          <label>
            Ticket / etiquette
            <input type="file" accept="image/*,.txt" onChange={(event) => setPhoto(event.target.files?.[0] || null)} />
          </label>

          <label>
            Texte OCR manuel
            <textarea
              rows="6"
              value={form.raw_text}
              onChange={(event) => updateField("raw_text", event.target.value)}
              placeholder="Collez ici le texte du ticket si vous voulez aider l'extraction."
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={confirmLowConfidence}
              onChange={(event) => setConfirmLowConfidence(event.target.checked)}
            />
            Confirmer la soumission si l'IA hesite sur le produit
          </label>

          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Envoi..." : "Soumettre et gagner 10 points"}
          </button>
        </form>

        <aside className="panel aside-panel">
          <div className="panel-heading">
            <h2>Lecture OCR</h2>
          </div>
          {preview ? (
            <div className="stacked-info">
              <p><strong>Produit detecte:</strong> {preview.detected_product_name || "-"}</p>
              <p><strong>Prix detecte:</strong> {preview.detected_price ? `${Number(preview.detected_price).toFixed(3)} TND` : "-"}</p>
              <p><strong>Magasin suggere:</strong> {preview.merchant_hint || "-"}</p>
              <p><strong>Texte brut:</strong> {preview.raw_text || "Aucun texte fourni."}</p>
            </div>
          ) : (
            <p className="muted">Ajoutez une image ou du texte puis lancez l'analyse.</p>
          )}

          {result ? (
            <>
              <hr className="separator" />
              <div className="stacked-info">
                <p><strong>Produit normalise:</strong> {result.normalization.normalized_name}</p>
                <p><strong>Confiance:</strong> {Number(result.normalization.confidence).toFixed(2)}</p>
                <p><strong>Statut:</strong> {result.price.status}</p>
                <p><strong>Points gagnes:</strong> +{result.points_awarded}</p>
                <p><strong>Total points:</strong> {result.user?.points ?? "-"}</p>
                {needsConfirmation ? <p className="warning">Confirmation requise si la confiance est basse.</p> : null}
              </div>
            </>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
