const express = require('express');
const router = express.Router();
const { plantDatabase } = require('../data/plantDatabase');
const { fetchWikipediaSummary } = require('../services/plantSummaryCache');

router.get('/', (req, res) => {
  const search = String(req.query.search || '').trim();
  const type = String(req.query.type || 'all');
  const sunlight = String(req.query.sunlight || 'all');
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const perPage = 6;

  const filteredPlants = plantDatabase.filter((plant) => {
    const haystack = `${plant.commonName} ${plant.scientificName} ${plant.genus} ${plant.family}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesType = type === 'all' || plant.type === type;
    const matchesSunlight = sunlight === 'all' || plant.sunlightPreference === sunlight;
    return matchesSearch && matchesType && matchesSunlight;
  });

  const totalPages = Math.max(Math.ceil(filteredPlants.length / perPage), 1);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;

  res.render('plant-database/index', {
    plantDatabase: filteredPlants.slice(start, start + perPage),
    filters: { search, type, sunlight },
    pagination: {
      currentPage,
      totalPages,
      totalResults: filteredPlants.length,
      perPage
    }
  });
});

router.get('/api/summary', async (req, res) => {
  const query = String(req.query.query || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const result = await fetchWikipediaSummary(query);
    return res.json(result);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
});

module.exports = router;
