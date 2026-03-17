const express = require('express');
const router = express.Router();
const db = require('../database');
const { createPlantModel } = require('../models/plant');
const plantModel = createPlantModel(db);

router.get('/', (req, res) => {
  const reminders = plantModel.getReminders();
  const grouped = { water: [], feed: [], weed: [], prune: [] };
  reminders.forEach(r => {
    if (grouped[r.type]) grouped[r.type].push(r);
  });
  res.render('reminders/index', { reminders, grouped });
});

module.exports = router;
