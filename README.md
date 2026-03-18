# Garden Manager

A **Progressive Web App (PWA)** for managing garden plants with automated care reminders and species data powered by the [GBIF API](https://www.gbif.org/developer/summary).

---

## Table of Contents

1. [Features](#features)
2. [Getting Started](#getting-started)
3. [Plant Types](#plant-types)
4. [Reminder Logic](#reminder-logic)
5. [GBIF Species Lookup](#gbif-species-lookup)
6. [API Reference](#api-reference)
7. [Project Structure](#project-structure)
8. [Development & Testing](#development--testing)

---

## Features

- 🌱 **Add, view, and delete plants** — track every plant in your garden with name, type, cultivation method, planting date, and notes.
- 🔔 **Smart care reminders** — automatically generated watering, feeding, weeding, and pruning schedules based on plant type and cultivation environment.
- 🔍 **GBIF Species Lookup** — search the Global Biodiversity Information Facility checklist directly from the Add Plant form to find the scientific name, family, and full taxonomy of any plant.
- 📱 **Progressive Web App** — works offline, installable on mobile and desktop via the browser's "Add to Home Screen" prompt.
- 🌍 **Broad plant coverage** — supports thirteen plant categories including vegetables, fruits, flowers, herbs, trees, shrubs, grasses, ferns, succulents, cacti, bulbs, climbers, and more.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (bundled with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Jake-Gibbons/Garden-Manager.git
cd Garden-Manager

# Install dependencies
npm install

# Start the server
npm start
```

Open your browser at **http://localhost:3000**.

The SQLite database file is created automatically at `data/garden.db` on first run.

---

## Plant Types

Garden Manager supports the following plant categories. Each type influences which care reminders are generated and, for water-sensitive types, adjusts the watering frequency.

| Type | Label | Pruning | Weed-sensitive | Water modifier | Description |
|------|-------|:-------:|:--------------:|:--------------:|-------------|
| `vegetable` | Vegetable | ✅ | ✅ | 0 | Edible herbaceous plants grown for leaves, stems, roots, or seeds (tomato, carrot, lettuce). |
| `fruit` | Fruit | ✅ | ✅ | 0 | Plants cultivated for edible fruits or berries (apple, strawberry, grape). |
| `flower` | Flower | ✅ | ✅ | 0 | Ornamental plants prized for their blooms (rose, tulip, dahlia, lavender). |
| `herb` | Herb | ❌ | ❌ | 0 | Aromatic or culinary plants grown for leaves or seeds (basil, mint, rosemary). |
| `tree` | Tree | ✅ (60 days) | ❌ | +1 day | Woody perennials with a single trunk (oak, maple, apple tree, cherry). |
| `shrub` | Shrub | ✅ (45 days) | ❌ | +1 day | Multi-stemmed woody perennials (hydrangea, boxwood, blueberry bush). |
| `grass` | Grass / Lawn | ❌ | ✅ | −1 day | Turf and ornamental grasses (fescue, bamboo, pampas grass). |
| `fern` | Fern | ❌ | ❌ | −1 day | Spore-reproducing vascular plants (Boston fern, maidenhair fern). |
| `succulent` | Succulent | ❌ | ❌ | +5 days | Drought-tolerant, water-storing plants (aloe vera, echeveria, jade plant). |
| `cactus` | Cactus | ❌ | ❌ | +10 days | Members of the Cactaceae family (saguaro, prickly pear, barrel cactus). |
| `bulb` | Bulb / Tuber | ❌ | ✅ | 0 | Plants from underground storage organs (tulip, daffodil, dahlia, potato). |
| `climber` | Climber / Vine | ✅ (30 days) | ❌ | 0 | Climbing or trailing plants (wisteria, clematis, sweet pea, ivy). |
| `other` | Other | ❌ | ❌ | 0 | Any plant that does not fit the above categories. |

> **Water modifier** is added to the base cultivation frequency (outdoor: every 2 days, indoor: every 3 days, greenhouse: every 1 day). A positive modifier means the plant needs watering *less often*; negative means *more often*.

---

## Reminder Logic

Reminders are generated automatically whenever you view the Reminders page. The rules are:

| Reminder | Frequency | Condition |
|----------|-----------|-----------|
| 💧 Water | Cultivation base + type modifier | All plants |
| 🌿 Feed | Every 14 days | All plants |
| 🌾 Weed | Every 7 days | Outdoor or greenhouse **and** weed-sensitive type |
| ✂️ Prune | Every 30–60 days (type-dependent) | Plant type has pruning enabled |

The due date for each reminder is calculated from the plant's planting date.

---

## GBIF Species Lookup

Garden Manager integrates with the **Global Biodiversity Information Facility (GBIF)** — the world's most comprehensive open-access database of biodiversity occurrence data.

### What is GBIF?

[GBIF](https://www.gbif.org) is an international network and research infrastructure funded by governments worldwide, providing free and open access to data about life on Earth. The GBIF backbone taxonomy covers over 9 million species and is the authoritative reference used by researchers, conservationists, and developers globally.

### How the integration works

1. **Search** — When adding a plant, type a common or scientific name in the *GBIF Species Lookup* panel and click **Search**.
2. **Results** — Garden Manager calls the GBIF Species Search endpoint (`GET /v1/species/search?q=…&kingdom=Plantae`) and displays up to 5 matching species with their scientific name, family, and kingdom.
3. **Use this name** — Clicking "Use this name" fills the plant **Name** field with the canonical species name and appends the scientific name and family to the **Notes** field.

### API endpoints used

| GBIF endpoint | Description |
|---------------|-------------|
| `GET https://api.gbif.org/v1/species/search?q={name}&kingdom=Plantae&rank=SPECIES&limit=5` | Search for plant species by name |
| `GET https://api.gbif.org/v1/species/{key}` | Get full taxonomic details for a species |

No API key or authentication is required. The GBIF API is free for public, non-commercial use.

### Garden Manager lookup endpoint

Garden Manager exposes a thin proxy route so the browser never needs to call GBIF directly:

```
GET /plants/lookup?q=<query>
```

**Response (200 OK)**:
```json
{
  "results": [
    {
      "key": 5284517,
      "scientificName": "Solanum lycopersicum L.",
      "canonicalName": "Solanum lycopersicum",
      "family": "Solanaceae",
      "genus": "Solanum",
      "kingdom": "Plantae",
      "rank": "SPECIES",
      "status": "ACCEPTED"
    }
  ]
}
```

**Error responses**:
- `400 Bad Request` — `q` parameter missing or empty.
- `502 Bad Gateway` — GBIF could not be reached (network error or timeout).

---

## API Reference

### Plants

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/plants` | List all plants |
| `GET` | `/plants/add` | Show the Add Plant form |
| `POST` | `/plants/add` | Create a new plant (redirects to `/plants`) |
| `POST` | `/plants/:id/delete` | Delete a plant by ID (redirects to `/plants`) |
| `GET` | `/plants/lookup?q=<query>` | GBIF species search — returns JSON |

### Reminders

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/reminders` | View all care reminders, grouped by type |

---

## Project Structure

```
Garden-Manager/
├── public/              # Static assets served to the browser
│   ├── css/style.css    # Custom green-themed styles (Bootstrap override)
│   ├── icons/           # PWA icons (192px, 512px, SVG)
│   ├── manifest.json    # PWA manifest
│   ├── offline.html     # Offline fallback page
│   └── sw.js            # Service worker (cache-first for assets, network-first for pages)
├── src/
│   ├── app.js           # Express server setup
│   ├── database.js      # SQLite initialisation (better-sqlite3)
│   ├── data/
│   │   └── plantTypes.js  # Plant category definitions & care metadata
│   ├── models/
│   │   └── plant.js     # Plant CRUD & reminder generation logic
│   ├── routes/
│   │   ├── index.js     # Home / dashboard route
│   │   ├── plants.js    # Plant CRUD + GBIF lookup routes
│   │   └── reminders.js # Reminders view route
│   └── services/
│       └── gbif.js      # GBIF API client (searchSpecies, getSpeciesInfo)
├── tests/
│   ├── plant.model.test.js  # Unit tests for plant model
│   └── routes.test.js       # Integration tests for HTTP routes
├── views/               # EJS server-side templates
│   ├── index.ejs        # Dashboard
│   ├── partials/        # Shared header & footer
│   ├── plants/
│   │   ├── add.ejs      # Add Plant form + GBIF lookup panel
│   │   └── index.ejs    # Plant list
│   └── reminders/
│       └── index.ejs    # Reminders grouped by type
├── package.json
└── README.md
```

---

## Development & Testing

```bash
# Run the test suite (Jest + Supertest)
npm test

# Start the development server
npm start
```

Tests use an **in-memory SQLite database** so no data file is created or modified during testing.

### Technology stack

| Layer | Technology |
|-------|-----------|
| Server | Node.js + Express 4 |
| Templates | EJS |
| Database | SQLite via better-sqlite3 |
| Frontend | Bootstrap 5.3 + custom CSS |
| PWA | Service Worker + Web Manifest |
| Testing | Jest + Supertest |
| Species data | GBIF API |
