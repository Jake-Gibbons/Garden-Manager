const express = require('express');
const router = express.Router();
const { plantDatabase } = require('../data/plantDatabase');
const { getPlantTypeOptions } = require('../data/plantTypes');
const { fetchWikipediaSummary } = require('../services/plantSummaryCache');

function getPlantDatabaseTypeOptions() {
  return getPlantTypeOptions().filter((option) => (
    option.value !== 'other' && plantDatabase.some((plant) => plant.type === option.value)
  ));
}

function filterPlants(search, type, sunlight) {
  return plantDatabase.filter((plant) => {
    const haystack = `${plant.commonName} ${plant.scientificName} ${plant.genus} ${plant.family}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesType = type === 'all' || plant.type === type;
    const matchesSunlight = sunlight === 'all' || plant.sunlightPreference === sunlight;
    return matchesSearch && matchesType && matchesSunlight;
  });
}

router.get('/', (req, res) => {
  const search = String(req.query.search || '').trim();
  const type = String(req.query.type || 'all');
  const sunlight = String(req.query.sunlight || 'all');
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const perPage = 18;

  const filteredPlants = filterPlants(search, type, sunlight);

  const totalPages = Math.max(Math.ceil(filteredPlants.length / perPage), 1);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;

  res.render('plant-database/index', {
    plantDatabase: filteredPlants.slice(start, start + perPage),
    typeOptions: getPlantDatabaseTypeOptions(),
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

router.get('/:id/reference', async (req, res) => {
  const plant = plantDatabase.find((entry) => entry.id === req.params.id);

  if (!plant) {
    return res.status(404).send('Plant not found');
  }

  try {
    const summaryResult = await fetchWikipediaSummary(plant.scientificName || plant.commonName);
    return res.render('plant-database/reference', {
      plant,
      summary: summaryResult.summary,
      cached: summaryResult.cached,
      summaryError: null
    });
  } catch (error) {
    return res.render('plant-database/reference', {
      plant,
      summary: null,
      cached: false,
      summaryError: error.message
    });
  }
});

router.get('/:id', (req, res) => {
  const plant = plantDatabase.find((entry) => entry.id === req.params.id);

  if (!plant) {
    return res.status(404).send('Plant not found');
  }

  const relatedPlants = plantDatabase
    .filter((entry) => entry.type === plant.type && entry.id !== plant.id)
    .slice(0, 4);

  return res.render('plant-database/show', {
    plant,
    relatedPlants
  });
});

module.exports = router;
