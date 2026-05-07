
# 🇹🇳  SoumiTaw — Plateforme Intelligente de Comparaison des Prix en Tunisie

> **Transparence des prix alimentaires pour les citoyens, commerçants et l'État tunisien.**
> Stack : React + FastAPI + PostgreSQL + Azure + OpenAI

---

## 📌 Vision du projet

SoumniTek est une plateforme web tunisienne basée sur l'IA qui permet :
- Aux **citoyens** de comparer les prix des produits alimentaires par région
- Aux **commerçants** de publier leurs prix et attirer des clients
- À **l'État** d'avoir un tableau de bord économique en temps réel

---

## 🏗️ Architecture générale

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                         │
│              React + Vite + TailwindCSS                 │
│   [ Citoyens ] [ Commerçants ] [ Dashboard État ]       │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / REST API
┌───────────────────────▼─────────────────────────────────┐
│                     API GATEWAY                         │
│                   FastAPI (Python)                      │
│     /api/prices  /api/products  /api/merchants          │
│     /api/submit  /api/stats     /api/admin              │
└──────┬──────────────┬───────────────────┬───────────────┘
       │              │                   │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────────▼──────────────┐
│  PostgreSQL │ │ Azure Blob │ │   Azure OpenAI (GPT-4o) │
│  (Prix, DB) │ │  (Photos)  │ │ + Azure AI Vision (OCR) │
└─────────────┘ └────────────┘ └────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                 INFRASTRUCTURE AZURE                    │
│   Container Apps · ACR · Key Vault · App Insights       │
│   PostgreSQL Flexible · Blob Storage · Azure Monitor    │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des dossiers

```
soumnitek/
├── frontend/                          # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx               # Page d'accueil + recherche
│   │   │   ├── ProductDetail.jsx      # Détail produit + graphique prix
│   │   │   ├── SubmitPrice.jsx        # Soumettre un prix (photo/manuel)
│   │   │   ├── Map.jsx                # Carte interactive des prix
│   │   │   ├── Alerts.jsx             # Alertes prix personnalisées
│   │   │   ├── Profile.jsx            # Profil citoyen + points
│   │   │   ├── merchant/
│   │   │   │   ├── Dashboard.jsx      # Dashboard commerçant
│   │   │   │   ├── ManagePrices.jsx   # Gérer les prix publiés
│   │   │   │   └── ShopProfile.jsx    # Profil boutique
│   │   │   └── admin/
│   │   │       ├── NationalView.jsx   # Vue nationale État
│   │   │       ├── ProductAnalysis.jsx# Analyse par produit
│   │   │       └── Reports.jsx        # Rapports + exports
│   │   ├── components/
│   │   │   ├── PriceCard.jsx
│   │   │   ├── PriceChart.jsx
│   │   │   ├── HeatMap.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   └── Navbar.jsx
│   │   ├── services/
│   │   │   ├── api.js                 # Appels API centralisés
│   │   │   └── auth.js                # Authentification
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
│
├── backend/                           # FastAPI Python
│   ├── app/
│   │   ├── main.py                    # Entry point FastAPI
│   │   ├── routers/
│   │   │   ├── prices.py              # CRUD prix
│   │   │   ├── products.py            # Gestion produits
│   │   │   ├── merchants.py           # Espace commerçant
│   │   │   ├── submit.py              # Soumission citoyens
│   │   │   ├── stats.py               # Statistiques + tendances
│   │   │   └── admin.py               # Dashboard État
│   │   ├── services/
│   │   │   ├── ocr_service.py         # Azure AI Vision OCR
│   │   │   ├── ai_service.py          # GPT-4o normalisation
│   │   │   ├── anomaly_service.py     # Détection fausses données
│   │   │   └── geo_service.py         # Géolocalisation
│   │   ├── models/
│   │   │   ├── price.py
│   │   │   ├── product.py
│   │   │   ├── merchant.py
│   │   │   └── user.py
│   │   └── database.py                # Connexion PostgreSQL
│   ├── Dockerfile
│   └── requirements.txt
│
├── infrastructure/                    # Terraform IaC
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       ├── container_apps/
│       ├── postgresql/
│       ├── keyvault/
│       └── storage/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                  # GitHub Actions CI/CD
│
├── docker-compose.yml                 # Dev local
├── .env.example
└── README.md
```

---

## 🗄️ Schéma base de données

```sql
-- Produits normalisés par l'IA
CREATE TABLE products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,        -- "Huile végétale 1L"
    category    VARCHAR(100),                 -- "Corps gras"
    unit        VARCHAR(50),                  -- "litre", "kg", "unité"
    barcode     VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Commerçants vérifiés
CREATE TABLE merchants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(50),                  -- "épicerie", "supermarché"
    address     TEXT,
    city        VARCHAR(100),
    region      VARCHAR(100),
    latitude    DECIMAL(9,6),
    longitude   DECIMAL(9,6),
    verified    BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Prix soumis (citoyens ou commerçants)
CREATE TABLE prices (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID REFERENCES products(id),
    merchant_id   UUID REFERENCES merchants(id),
    price         DECIMAL(10,3) NOT NULL,     -- en Dinars Tunisiens
    currency      VARCHAR(3) DEFAULT 'TND',
    source        VARCHAR(20),                -- "citizen" | "merchant" | "scraper"
    confidence    DECIMAL(3,2),              -- score IA 0.0 → 1.0
    status        VARCHAR(20) DEFAULT 'pending', -- "pending"|"approved"|"rejected"
    photo_url     TEXT,
    latitude      DECIMAL(9,6),
    longitude     DECIMAL(9,6),
    city          VARCHAR(100),
    region        VARCHAR(100),
    submitted_by  UUID REFERENCES users(id),
    submitted_at  TIMESTAMP DEFAULT NOW(),
    verified_at   TIMESTAMP
);

-- Utilisateurs
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE,
    phone         VARCHAR(20),
    role          VARCHAR(20) DEFAULT 'citizen', -- "citizen"|"merchant"|"admin"
    points        INTEGER DEFAULT 0,
    reputation    DECIMAL(3,2) DEFAULT 0.5,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Alertes prix
CREATE TABLE price_alerts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id),
    product_id    UUID REFERENCES products(id),
    target_price  DECIMAL(10,3),
    condition     VARCHAR(10),               -- "below" | "above"
    region        VARCHAR(100),
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW()
);
```

---

## 📄 Pages & fonctionnalités détaillées

### Page 1 — Accueil (`/`)
**Objectif :** Trouver rapidement le prix le moins cher
- [ ] Barre de recherche produit avec autocomplétion
- [ ] Carte interactive (Leaflet.js) avec marqueurs prix
- [ ] Top 5 produits les moins chers aujourd'hui
- [ ] Filtre par ville / gouvernorat
- [ ] Indicateur d'inflation du jour (+X% vs semaine dernière)

### Page 2 — Détail Produit (`/product/:id`)
**Objectif :** Analyser un produit en profondeur
- [ ] Graphique prix dans le temps (Chart.js — 7j/30j/90j)
- [ ] Prix min / max / moyen par région
- [ ] Liste commerçants avec prix + distance + note
- [ ] Bouton "Signaler un prix incorrect"
- [ ] Bouton "Créer une alerte prix"

### Page 3 — Soumettre un prix (`/submit`)
**Objectif :** Contribution citoyenne avec IA
- [ ] Upload photo (ticket de caisse ou étiquette prix)
- [ ] Azure AI Vision OCR → extraction automatique prix + produit
- [ ] GPT-4o normalise le nom du produit
- [ ] Formulaire de confirmation si IA incertaine (score < 0.8)
- [ ] Géolocalisation GPS automatique
- [ ] +10 points ajoutés au profil citoyen

### Page 4 — Carte des prix (`/map`)
**Objectif :** Vision géographique des prix
- [ ] Heatmap par gouvernorat (rouge=cher, vert=bon marché)
- [ ] Filtre par catégorie de produit
- [ ] Comparaison inter-régions
- [ ] Clic sur zone → liste des prix locaux

### Page 5 — Alertes (`/alerts`)
**Objectif :** Être notifié quand le prix baisse
- [ ] Créer alerte : produit + prix cible + région
- [ ] Liste des alertes actives
- [ ] Historique des notifications reçues

### Page 6 — Profil Citoyen (`/profile`)
**Objectif :** Gamification + fidélisation
- [ ] Score de points et niveau (Contributeur / Expert / Champion)
- [ ] Historique des soumissions avec statut (approuvé/refusé)
- [ ] Badges gagnés
- [ ] Classement régional

### Page 7 — Dashboard Commerçant (`/merchant/dashboard`)
**Objectif :** Gérer sa présence et attirer des clients
- [ ] Vue de tous ses prix publiés
- [ ] Statistiques : vues de sa fiche cette semaine
- [ ] Comparaison anonymisée avec concurrents
- [ ] Alertes si ses prix détectés comme anormaux

### Page 8 — Gestion des prix (`/merchant/prices`)
**Objectif :** Publier et mettre à jour les prix facilement
- [ ] Liste produits + champ prix + date màj
- [ ] Import CSV pour les grands commerçants
- [ ] Indication "Votre prix est X% au-dessus de la moyenne"

### Page 9 — Profil Boutique (`/merchant/profile`)
- [ ] Nom, adresse, horaires, photo boutique
- [ ] Catégorie et spécialités
- [ ] Avis citoyens

### Page 10 — Vue Nationale État (`/admin/national`)
**Objectif :** Tableau de bord décisionnel
- [ ] Carte thermique nationale en temps réel
- [ ] Indice inflation alimentaire par gouvernorat
- [ ] Alertes automatiques si variation > 15% sur 7 jours
- [ ] Top produits en forte hausse

### Page 11 — Analyse produit (`/admin/product/:id`)
- [ ] Historique complet avec anomalies détectées
- [ ] Régions les plus affectées par les hausses
- [ ] Corrélation avec événements (Ramadan, saisons...)

### Page 12 — Rapports (`/admin/reports`)
- [ ] Export PDF / Excel des données
- [ ] Rapport hebdomadaire automatique par email
- [ ] Données agrégées par gouvernorat

---

## 🤖 Services IA

### OCR — Lecture de tickets
```python
# backend/app/services/ocr_service.py
# Azure AI Vision extrait le texte du ticket
# GPT-4o identifie : nom produit, prix, date, magasin
```

### Normalisation des produits
```python
# "huile Cristal 1l" → product_id: uuid-huile-vegetale-1L
# "زيت نباتي" → product_id: uuid-huile-vegetale-1L
# Gère arabe, français, dialecte tunisien
```

### Détection d'anomalies
```python
# Prix anormal = mis en quarantaine
# Règle : prix > moyenne + 3*écart_type → status="pending"
# Règle : même IP, 10 soumissions en 1h → flagged
```

---

## 🛡️ Qualité des données

| Mécanisme | Description |
|-----------|-------------|
| Score de confiance IA | Chaque prix a un score 0→1 |
| Vote communautaire | 3 confirmations = auto-approuvé |
| Réputation utilisateur | Les anciens contributeurs ont plus de poids |
| Géofencing | Le prix doit être soumis depuis la zone du commerçant |
| Vérification commerçant | Numéro de patente obligatoire |
| Quarantaine automatique | Prix hors norme → review manuelle |

---

## 🚀 Sprints de développement

### Sprint 1 — Fondations (Semaine 1-2)
- [ ] Setup repo GitHub + branch protection
- [ ] Docker Compose local (frontend + backend + postgres)
- [ ] Base de données : migrations initiales
- [ ] API : `/health`, `/api/products`, `/api/prices`
- [ ] Frontend : Page Accueil + SearchBar basique

### Sprint 2 — Soumission citoyenne (Semaine 3-4)
- [ ] Page Soumettre un prix (formulaire manuel)
- [ ] Intégration Azure AI Vision (OCR photos)
- [ ] Intégration GPT-4o (normalisation produits)
- [ ] Système de points utilisateurs
- [ ] Page Détail Produit + graphique basique

### Sprint 3 — Carte & Géolocalisation (Semaine 5-6)
- [ ] Intégration Leaflet.js
- [ ] Page Carte des prix
- [ ] Heatmap par gouvernorat
- [ ] Filtre par région / catégorie

### Sprint 4 — Espace Commerçant (Semaine 7-8)
- [ ] Authentification commerçant
- [ ] Dashboard commerçant
- [ ] Publication des prix (manuel + CSV)
- [ ] Profil boutique

### Sprint 5 — Qualité & Modération (Semaine 9-10)
- [ ] Détection anomalies (algorithme)
- [ ] Interface de modération admin
- [ ] Système de votes citoyens
- [ ] Score de réputation utilisateur

### Sprint 6 — Dashboard État (Semaine 11-12)
- [ ] Vue nationale avec heatmap
- [ ] Alertes automatiques inflation
- [ ] Rapports PDF / Excel
- [ ] API publique (lecture seule)

### Sprint 7 — CI/CD & Production (Semaine 13-14)
- [ ] GitHub Actions : lint + test + build + push ACR
- [ ] Deploy sur Azure Container Apps (infra existante)
- [ ] Secrets via Key Vault (déjà configuré ✅)
- [ ] Monitoring Application Insights (déjà configuré ✅)
- [ ] Alertes Azure Monitor (déjà configurées ✅)

---

## ⚙️ Variables d'environnement

```env
# .env.example

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/soumnitek

# Azure
AZURE_STORAGE_CONNECTION_STRING=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_KEY=
AZURE_VISION_ENDPOINT=
AZURE_VISION_KEY=

# Auth
JWT_SECRET=                          # → Key Vault: jwt-secret
SECRET_KEY=

# App
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```

> ⚠️ **Tous les secrets en production sont dans Azure Key Vault** (déjà configuré ✅)

---

## 🐳 Lancer en local

```bash
# 1. Cloner le repo
git clone https://github.com/AbdouHanafy/soumnitek.git
cd soumnitek

# 2. Copier les variables d'environnement
cp .env.example .env
# Remplir les valeurs dans .env

# 3. Lancer avec Docker Compose
docker compose up --build

# Frontend  → http://localhost:3000
# Backend   → http://localhost:8000
# API Docs  → http://localhost:8000/docs
```

---

## ☁️ Infrastructure Azure (déjà prête ✅)

| Service | Nom | Statut |
|---------|-----|--------|
| Container Apps | ca-catalog, ca-cart, ca-orders, ca-auth | ✅ Running |
| Container Registry | acrcloudshopabdou | ✅ Ready |
| Key Vault | kv-cloudshop-abdou | ✅ Configured |
| Application Insights | ai-cloudshop | ✅ Connected |
| Azure Monitor Alerts | 5 alertes configurées | ✅ Active |
| PostgreSQL | Azure DB for PostgreSQL | ✅ Ready |

> 💡 L'infrastructure CloudShop existante sera réutilisée pour SoumniTek.
> Nouveaux Container Apps à créer : `ca-frontend`, `ca-backend`, `ca-worker`

---

## 📊 Business Model

| Phase | Source de revenus | Timing |
|-------|------------------|--------|
| MVP | Gratuit — acquisition utilisateurs | Mois 1-3 |
| Croissance | Publicité locale commerçants | Mois 3+ |
| Scale | Abonnement commerçants premium | Mois 4+ |
| Institutionnel | Licence dashboard État | Mois 6+ |
| Data | Rapports marché (importateurs, GMS) | Mois 8+ |

---

## 🤝 Contribution

```bash
# Créer une branche
git checkout -b feat/nom-de-la-feature

# Commiter
git commit -m "feat: description claire"

# Push + Pull Request
git push origin feat/nom-de-la-feature
```

**Conventions de commit :**
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `refactor:` refactoring
- `test:` ajout de tests

---

## 📞 Contact

- **Fondateur :** Abderrahmen Hanafi
- **Email :** abdouhanafi090@gmail.com
- **GitHub :** [@AbdouHanafy](https://github.com/AbdouHanafy)

---

*Construit avec ❤️ pour la Tunisie 🇹🇳 — SoumniTek 2026*
