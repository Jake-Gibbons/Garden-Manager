const express = require('express');

const router = express.Router();

const markerTypes = [
  { value: 'vegetable-bed', label: 'Vegetable Bed', color: '#4f8f5b', icon: 'VB' },
  { value: 'herb-patch', label: 'Herb Patch', color: '#5b8a3c', icon: 'HB' },
  { value: 'fruit-zone', label: 'Fruit Zone', color: '#c96b4b', icon: 'FZ' },
  { value: 'flower-border', label: 'Flower Border', color: '#d47aa5', icon: 'FB' },
  { value: 'compost', label: 'Compost', color: '#7b5a3b', icon: 'CP' },
  { value: 'irrigation', label: 'Irrigation', color: '#3c80d9', icon: 'IR' }
];

router.get('/', (req, res) => {
  res.render('garden-plan/index', { markerTypes });
});

module.exports = router;
