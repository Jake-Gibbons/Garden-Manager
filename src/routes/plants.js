const express = require('express');
const router = express.Router();
const db = require('../database');
const { createPlantModel } = require('../models/plant');
const { plantCatalog } = require('../data/plantCatalog');
const plantModel = createPlantModel(db);

router.get('/', (req, res) => {
  const plants = plantModel.getAllPlants();
  res.render('plants/index', { plants });
});

router.get('/add', (req, res) => {
  const preselectedPlantId = String(req.query.template || '');
  res.render('plants/add', { plantCatalog, preselectedPlantId });
});

router.get('/:id/edit', (req, res) => {
  const plant = plantModel.getPlantById(req.params.id);
  if (!plant) {
    return res.status(404).send('Plant not found');
  }
  return res.render('plants/edit', { plant, plantCatalog });
});

router.post('/add', (req, res) => {
  const {
    name,
    common_name,
    scientific_name,
    genus,
    family,
    sunlight_preference,
    soil_type,
    common_pests_diseases,
    toxicity,
    type,
    cultivation,
    planting_date,
    notes
  } = req.body;

  const finalName = name || common_name || scientific_name || 'Unnamed Plant';
  plantModel.addPlant({
    name: finalName,
    common_name,
    scientific_name,
    genus,
    family,
    sunlight_preference,
    soil_type,
    common_pests_diseases,
    toxicity,
    type,
    cultivation,
    planting_date,
    notes
  });
  res.redirect('/plants');
});

router.post('/:id/edit', (req, res) => {
  const {
    name,
    common_name,
    scientific_name,
    genus,
    family,
    sunlight_preference,
    soil_type,
    common_pests_diseases,
    toxicity,
    type,
    cultivation,
    planting_date,
    notes
  } = req.body;

  const finalName = name || common_name || scientific_name || 'Unnamed Plant';
  plantModel.updatePlant(req.params.id, {
    name: finalName,
    common_name,
    scientific_name,
    genus,
    family,
    sunlight_preference,
    soil_type,
    common_pests_diseases,
    toxicity,
    type,
    cultivation,
    planting_date,
    notes
  });

  res.redirect('/plants');
});

router.post('/:id/delete', (req, res) => {
  plantModel.deletePlant(req.params.id);
  res.redirect('/plants');
});

module.exports = router;
