const express = require('express');
const router = express.Router();
const db = require('../database');
const { createPlantModel } = require('../models/plant');
const { getPlantTypeOptions } = require('../data/plantTypes');
const { searchSpecies } = require('../services/gbif');
const plantModel = createPlantModel(db);

router.get('/', (req, res) => {
  const plants = plantModel.getAllPlants();
  res.render('plants/index', { plants });
});

router.get('/add', (req, res) => {
  res.render('plants/add', { plantTypeOptions: getPlantTypeOptions() });
});

/**
 * GET /plants/lookup?q=<query>
 * Searches the GBIF species checklist and returns up to 5 matching plant
 * species as JSON.  Used by the client-side GBIF lookup on the Add Plant form.
 */
router.get('/lookup', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }
  try {
    const results = await searchSpecies(query);
    res.json({ results });
  } catch (err) {
    console.error('GBIF lookup error:', err.message);
    const isTimeout = err.message.includes('timed out');
    const message = isTimeout
      ? 'GBIF lookup timed out. Please try again later.'
      : 'GBIF lookup failed. Please check your connection and try again.';
    res.status(502).json({ error: message });
  }
});

router.post('/add', (req, res) => {
  const { name, type, cultivation, planting_date, notes } = req.body;
  plantModel.addPlant({ name, type, cultivation, planting_date, notes });
  res.redirect('/plants');
});

router.post('/:id/delete', (req, res) => {
  plantModel.deletePlant(req.params.id);
  res.redirect('/plants');
});

module.exports = router;
