export default function Navbar({ currentPath }) {
  const links = [
    { href: "#/", label: "Accueil" },
    { href: "#/map", label: "Carte" },
    { href: "#/submit", label: "Soumettre" },
    { href: "#/profile", label: "Profil" },
  ];

  return (
    <header className="site-nav">
      <a href="#/" className="brand">
        SoumiTaw
      </a>
      <nav>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={currentPath === link.href.replace("#", "") ? "active" : ""}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
