const express = require('express');
const router = express.Router();
const db = require('../database');
const { createPlantModel } = require('../models/plant');
const plantModel = createPlantModel(db);

router.get('/', (req, res) => {
  const plants = plantModel.getAllPlants();
  const reminders = plantModel.getReminders();
  res.render('index', { plantCount: plants.length, reminderCount: reminders.length });
});

module.exports = router;
