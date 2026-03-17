const express = require('express');
const router = express.Router();
const db = require('../database');
const { createPlantModel } = require('../models/plant');
const plantModel = createPlantModel(db);

router.get('/', (req, res) => {
  const plants = plantModel.getAllPlants();
  res.render('plants/index', { plants });
});

router.get('/add', (req, res) => {
  res.render('plants/add');
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
