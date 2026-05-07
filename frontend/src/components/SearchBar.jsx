export default function SearchBar({ value, onChange, onSubmit, city, onCityChange }) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Rechercher un produit"
        aria-label="Rechercher un produit"
      />
      <input
        type="text"
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
        placeholder="Ville"
        aria-label="Filtrer par ville"
      />
      <button type="submit">Chercher</button>
    </form>
  );
}
